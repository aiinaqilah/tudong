import { redirect } from "next/navigation";
import Stripe from "stripe";
import Link from "next/link";
import { client } from "@/sanity/lib/client";

const getCheckoutSession = async (sessionId: string) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-05-27.dahlia',
    });
    return stripe.checkout.sessions.retrieve(sessionId);
};

type SanityOrder = {
    orderNumber: string;
    totalPrice: number;
};

const CheckoutSuccessPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ session_id: string }>;
}) => {
    const { session_id } = await searchParams;

    if (!session_id) redirect('/');

    const session = await getCheckoutSession(session_id);

    if (!session) redirect('/');

    // Fetch order(s) created by this checkout session
    const orders = await client.fetch<SanityOrder[]>(
        `*[_type == "order" && stripeCheckoutSessionId == $sessionId] | order(orderNumber asc){ orderNumber, totalPrice }`,
        { sessionId: session_id },
        { cache: "no-store" }
    );

    const total = new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format((session.amount_total || 0) / 100);

    return (
        <div className='min-h-[60vh] flex items-center justify-center'>
            <div className='max-w-md w-full mx-auto p-6'>
                <div className='bg-white rounded-2xl shadow-xl p-6 text-center'>
                    <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg
                            className='w-8 h-8 text-green-500'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M5 13l4 4L19 7'
                            />
                        </svg>
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                        Thank you for your order!
                    </h1>
                    <p className='text-gray-600 mb-6'>
                        We have received your order and will send you a confirmation email shortly!
                    </p>
                    {orders.length > 0 && (
                        <div className='mb-4 space-y-1'>
                            {orders.map((order) => (
                                <div key={order.orderNumber} className='text-sm text-gray-500'>
                                    Order #{order.orderNumber}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className='text-sm text-gray-500 mb-1'>
                        Order total: {total}
                    </div>
                    <div className='text-sm text-gray-500 mb-6'>
                        Order email: {session.customer_details?.email}
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Link
                            href='/dashboard/customer/orders'
                            className='bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors'
                        >
                            View My Orders
                        </Link>
                        <Link
                            href='/'
                            className='text-gray-500 text-sm hover:text-gray-700 transition-colors'
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
