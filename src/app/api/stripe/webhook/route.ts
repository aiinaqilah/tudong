import prisma from "@/lib/prisma";
import { createClient } from "next-sanity";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

type SanityProduct = {
  _id: string;
  sellerId: string | null;
};

export async function POST(req: Request) {
    // Get Stripe client
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-05-27.dahlia'
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    // Get sanity client
    const sanityClient = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
        token: process.env.SANITY_API_WRITE_TOKEN,
    });

    try {
        const body = await req.text();
        const headerList = await headers();
        const signature = headerList.get("stripe-signature");

        if(!signature) {
            return NextResponse.json(
                { error: 'No signature found '},
                { status: 400 }
            );
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                webhookSecret
            );
        } catch(e) {
            console.log("Event couldn't be constructed:");
            console.log(e);
            return NextResponse.json(
                { error: 'Invalid signature '},
                { status: 400 }
            ); 
        }

        switch(event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                const cartId = session.metadata?.cartId;
                const userId = session.metadata?.userId;

                if(!cartId) {
                    throw new Error("No cart ID in session metadata");
                }

                const cart = await prisma.cart.findUnique({
                    where: {
                        id: cartId
                    },
                    include: {
                        items: true,
                    }
                });

                if(!cart) {
                    throw new Error("Cart not found");
                }

                // Fetch sellerId for each product from Sanity
                const productIds = cart.items.map((item) => item.sanityProductId);
                const products = await sanityClient.fetch<SanityProduct[]>(
                    `*[_type == "product" && _id in $productIds]{ _id, sellerId }`,
                    { productIds }
                );

                const sellerMap = new Map<string, SanityProduct>();
                for (const p of products) {
                    sellerMap.set(p._id, p);
                }

                // Group cart items by seller
                const itemsBySeller = new Map<string, typeof cart.items>();
                for (const item of cart.items) {
                    const product = sellerMap.get(item.sanityProductId);
                    const sellerId = product?.sellerId ?? "unknown";
                    const existing = itemsBySeller.get(sellerId) ?? [];
                    existing.push(item);
                    itemsBySeller.set(sellerId, existing);
                }

                const shippingAddress = {
                    _type: 'shippingAddress' as const,
                    name: session.collected_information?.shipping_details?.name,
                    line1: session.collected_information?.shipping_details?.address?.line1,
                    line2: session.collected_information?.shipping_details?.address?.line2,
                    city: session.collected_information?.shipping_details?.address?.city,
                    state: session.collected_information?.shipping_details?.address?.state,
                    postalCode: session.collected_information?.shipping_details?.address?.postal_code,
                    country: session.collected_information?.shipping_details?.address?.country,
                };

                // Create one order per seller
                let orderIndex = 0;
                for (const [sellerId, items] of itemsBySeller) {
                    orderIndex++;
                    const sellerTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                    const orderNumber = itemsBySeller.size > 1
                        ? `${session.id.slice(-8).toUpperCase()}-${orderIndex}`
                        : session.id.slice(-8).toUpperCase();

                    await sanityClient.create({
                        _type: 'order',
                        orderNumber,
                        orderDate: new Date().toISOString(),
                        customerId: userId !== '-' ? userId : undefined,
                        customerEmail: session.customer_details?.email,
                        customerName: session.customer_details?.name,
                        sellerId,
                        stripeCustomerId: typeof session.customer === 'object' ? session.customer?.id || '' : session.customer,
                        stripeCheckoutSessionId: session.id,
                        stripePaymentIntentId: session.payment_intent as string,
                        totalPrice: sellerTotal,
                        shippingAddress,
                        orderItems: items.map((item) => ({
                            _type: 'orderItem' as const,
                            _key: item.id,
                            product: {
                                _type: 'reference' as const,
                                _ref: item.sanityProductId,
                            },
                            quantity: item.quantity,
                            price: item.price
                        })),
                        status: 'PROCESSING',
                    });
                }

                await prisma.cart.delete({
                    where: {
                        id: cartId
                    }
                });
                break;
            }

            default: {
                console.log(`Unhandled event type: ${event.type}`);
                break;
            }
        }
        return NextResponse.json({ success: true });
    } catch(e) {
        console.log("Something went wrong:");
        console.log(e);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 },
        )
    }
}