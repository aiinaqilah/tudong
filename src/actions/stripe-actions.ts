"use server";

import Stripe from "stripe";
import { getCurrentSession } from "@/actions/auth";
import { getOrCreateCart } from "./cart-actions";
import { validatePromoCode } from "./promo-actions";
import { getShippingForProducts } from "./shipping-actions";
import { rateLimit } from "@/lib/rate-limit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
});

const FREE_SHIPPING_THRESHOLD = 150;
const DELIVERY_ESTIMATE = {
    minimum: { unit: 'business_day' as const, value: 3 },
    maximum: { unit: 'business_day' as const, value: 5 },
};

export const createCheckoutSession = async (cartId: string, promoCode?: string) => {
    const { user } = await getCurrentSession();

    if (!user) {
        throw new Error("Please sign in to continue to checkout.");
    }

    // Limit checkout session creation to 5 per minute per user to prevent
    // Stripe resource abuse.
    const limited = rateLimit(`user:${user.id}:checkout`, 5, 60_000);
    if (!limited.allowed) {
        throw new Error("Too many checkout attempts. Please try again shortly.");
    }

    const cart = await getOrCreateCart(cartId);

    if (cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    const subtotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Validate promo code server-side and create a Stripe coupon
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;

    if (promoCode) {
        const promo = await validatePromoCode(promoCode);
        if (promo.valid) {
            const coupon = await stripe.coupons.create(
                promo.discountType === 'percentage'
                    ? { percent_off: promo.discountValue, duration: 'once' }
                    : { amount_off: Math.round(promo.discountValue * 100), currency: 'myr', duration: 'once' }
            );
            discounts = [{ coupon: coupon.id }];
        }
    }

    // Calculate dynamic per-seller shipping, then combine into a single amount
    const productIds = cart.items.map((item) => item.sanityProductId);
    const sellerShipping = await getShippingForProducts(productIds);
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const totalShipping = isFreeShipping
        ? 0
        : sellerShipping.reduce((sum, s) => sum + s.shippingCost, 0);

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
        {
            shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                    currency: 'myr',
                    amount: Math.round(totalShipping * 100),
                },
                display_name: isFreeShipping ? 'Free Shipping' : 'Shipping',
                delivery_estimate: DELIVERY_ESTIMATE,
            },
        },
    ];

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: cart.items.map((item) => ({
            price_data: {
                currency: 'myr',
                product_data: {
                    name: item.size ? `${item.title} (${item.size})` : item.title,
                    images: [item.image]
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity,
        })),
        ...(discounts ? { discounts } : {}),
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL!}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL!}`,
        customer_email: user.email,
        metadata: {
            cartId: cart.id,
            userId: user.id.toString()
        },
        shipping_address_collection: {
            allowed_countries: ['MY', 'SG', 'BN']
        },
        shipping_options: shippingOptions,
    });

    if (!session.url) {
        throw new Error("Failed to create checkout session");
    }

    return session.url;
}
