"use server";

import Stripe from "stripe";
import { getCurrentSession } from "@/actions/auth";
import { getOrCreateCart } from "./cart-actions";
import { validatePromoCode } from "./promo-actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
});

export const createCheckoutSession = async (cartId: string, promoCode?: string) => {
    const { user } = await getCurrentSession();
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

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: cart.items.map((item) => ({
            price_data: {
                currency: 'myr',
                product_data: {
                    name: item.title,
                    images: [item.image]
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity,
        })),
        ...(discounts ? { discounts } : {}),
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL!}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL!}`,
        customer_email: user?.email,
        metadata: {
            cartId: cart.id,
            userId: user?.id?.toString() || '-'
        },
        shipping_address_collection: {
            allowed_countries: ['MY', 'SG', 'BN']
        },
        shipping_options: [
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        currency: 'myr',
                        amount: subtotal >= 15 ? 0 : 5 * 100
                    },
                    display_name: subtotal >= 15 ? 'Free Shipping' : 'Shipping',
                    delivery_estimate: {
                        minimum: { unit: 'business_day', value: 3 },
                        maximum: { unit: 'business_day', value: 5 },
                    }
                }
            }
        ]
    });

    if (!session.url) {
        throw new Error("Failed to create checkout session");
    }

    return session.url;
}
