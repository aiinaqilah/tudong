'use client';

import { createCheckoutSession } from '@/actions/stripe-actions';
import { validatePromoCode } from '@/actions/promo-actions';
import { formatPrice } from '@/lib/utils';
import { useCartStore, type CartItem as CartItemType } from '@/stores/cart-store';
import { Loader2, ShoppingCart, X, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';

const freeShippingAmount = 150;

const CartItem = ({ item }: { item: CartItemType }) => {
    const { removeItem, updateQuantity } = useCartStore(
        useShallow((state) => ({
            removeItem: state.removeItem,
            updateQuantity: state.updateQuantity,
        }))
    );

    const isFreeItem = item.price === 0;

    return (
        <div key={`cart-item-${item.id}`} className='flex gap-4 p-4 hover:bg-gray-50'>
            <div className='relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border'>
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className='object-cover'
                />
            </div>

            <div className='flex-1 min-w-0'>
                <h3 className='font-medium text-gray-900 truncate'>{item.title}</h3>
                <div className='text-sm text-gray-500 mt-1'>
                    {isFreeItem ? (
                        <span className='text-emerald-600 font-medium'>FREE</span>
                    ) : (
                        formatPrice(item.price)
                    )}
                </div>
                <div className='flex items-center gap-3 mt-2'>
                    {isFreeItem ? (
                        <div className='text-sm text-emerald-600 font-medium'>Prize Item</div>
                    ) : (
                        <>
                            <select
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                className='border rounded-md px-2 py-1 text-sm bg-white'
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <option key={`cart-qty-slct-${item.id}-${num}`} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => removeItem(item.id)}
                                className='text-red-500 text-sm hover:text-red-600'
                            >
                                Remove
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

type AppliedPromo = {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
};

const Cart = () => {
    const {
        cartId, items, close, isOpen,
        syncWithUser, setLoaded,
        getTotalPrice, getTotalItems,
    } = useCartStore(
        useShallow((state) => ({
            cartId: state.cartId,
            items: state.items,
            close: state.close,
            isOpen: state.isOpen,
            syncWithUser: state.syncWithUser,
            setLoaded: state.setLoaded,
            getTotalPrice: state.getTotalPrice,
            getTotalItems: state.getTotalItems,
        }))
    );

    useEffect(() => {
        const initCart = async () => {
            await useCartStore.persist.rehydrate();
            await syncWithUser();
            setLoaded(true);
        };
        initCart();
    }, []);

    const [loadingProceed, setLoadingProceed] = useState(false);

    // Promo code state
    const [promoInput, setPromoInput] = useState('');
    const [promoError, setPromoError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

    const totalPrice = getTotalPrice();

    const remainingForFreeShipping = useMemo(() => {
        return Math.max(0, freeShippingAmount - totalPrice);
    }, [totalPrice]);

    const promoDiscountAmount = useMemo(() => {
        if (!appliedPromo) return 0;
        if (appliedPromo.discountType === 'percentage') {
            return totalPrice * (appliedPromo.discountValue / 100);
        }
        return Math.min(appliedPromo.discountValue, totalPrice);
    }, [appliedPromo, totalPrice]);

    const discountedTotal = Math.max(0, totalPrice - promoDiscountAmount);

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;
        setPromoError('');
        setPromoLoading(true);

        const result = await validatePromoCode(promoInput);

        if (!result.valid) {
            setPromoError(result.error);
            setPromoLoading(false);
            return;
        }

        const discountAmount = result.discountType === 'percentage'
            ? totalPrice * (result.discountValue / 100)
            : Math.min(result.discountValue, totalPrice);

        setAppliedPromo({
            code: result.code,
            discountType: result.discountType,
            discountValue: result.discountValue,
            discountAmount,
        });
        setPromoInput('');
        setPromoLoading(false);
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoError('');
    };

    const handleProceedToCheckout = async () => {
        if (!cartId || loadingProceed) return;
        setLoadingProceed(true);
        const checkoutUrl = await createCheckoutSession(cartId, appliedPromo?.code);
        window.location.href = checkoutUrl;
        setLoadingProceed(false);
    };

    return (
        <>
            {isOpen && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity backdrop-blur-sm'
                    onClick={close}
                />
            )}

            <div
                className={`
                    fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-2xl
                    transform transition-transform duration-300 ease-in-out z-50
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className='flex flex-col h-full'>
                    <div className='flex items-center justify-between p-4 border-b bg-gray-50'>
                        <div className='flex items-center gap-2'>
                            <ShoppingCart className='w-5 h-5' />
                            <h2 className='text-lg font-semibold'>Shopping Cart</h2>
                            <span className='bg-gray-200 px-2 py-1 rounded-full text-sm font-medium'>
                                {getTotalItems()}
                            </span>
                        </div>
                        <button
                            onClick={close}
                            className='p-2 hover:bg-gray-200 rounded-full transition-colors'
                        >
                            <X className='w-5 h-5' />
                        </button>
                    </div>

                    <div className='flex-1 overflow-y-auto'>
                        {items.length === 0 ? (
                            <div className='flex flex-col items-center justify-center h-full p-4 text-center'>
                                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                                    <ShoppingCart className='w-8 h-8 text-gray-400' />
                                </div>
                                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                    Your cart is empty
                                </h3>
                                <p className='text-gray-500 mb-6'>
                                    Looks like you have not added any items to your cart yet!
                                </p>
                                <Link
                                    href="/"
                                    onClick={close}
                                    className='bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-900 transition-colors'
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className='divide-y'>
                                {items.map((item) => (
                                    <CartItem key={'cart-item-' + item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className='border-t'>
                            {remainingForFreeShipping > 0 ? (
                                <div className='p-4 bg-blue-50 border-b'>
                                    <div className='flex items-center gap-2 text-blue-800 mb-2'>
                                        <span>🚚</span>
                                        <span className='font-medium'>
                                            Add {formatPrice(remainingForFreeShipping)} more for FREE shipping
                                        </span>
                                    </div>
                                    <div className='w-full bg-blue-200 rounded-full h-2'>
                                        <div
                                            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                                            style={{ width: `${Math.min(100, (totalPrice / freeShippingAmount) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className='p-4 bg-green-50 border-b'>
                                    <div className='flex items-center gap-2 text-green-800'>
                                        <span>✨</span>
                                        <span className='font-medium'>You have unlocked FREE shipping!</span>
                                    </div>
                                </div>
                            )}

                            <div className='p-4 space-y-4'>
                                {/* Promo code input */}
                                {appliedPromo ? (
                                    <div className='flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2'>
                                        <div className='flex items-center gap-2 text-green-700'>
                                            <Tag className='w-4 h-4' />
                                            <span className='text-sm font-semibold'>{appliedPromo.code}</span>
                                            <span className='text-xs text-green-600'>
                                                ({appliedPromo.discountType === 'percentage'
                                                    ? `${appliedPromo.discountValue}% off`
                                                    : `RM${appliedPromo.discountValue} off`})
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleRemovePromo}
                                            className='text-green-600 hover:text-red-500 transition-colors'
                                        >
                                            <X className='w-4 h-4' />
                                        </button>
                                    </div>
                                ) : (
                                    <div className='space-y-1'>
                                        <div className='flex gap-2'>
                                            <input
                                                type='text'
                                                value={promoInput}
                                                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                                placeholder='Promo code'
                                                className='flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={promoLoading || !promoInput.trim()}
                                                className='px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                            >
                                                {promoLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Apply'}
                                            </button>
                                        </div>
                                        {promoError && (
                                            <p className='text-xs text-red-500'>{promoError}</p>
                                        )}
                                    </div>
                                )}

                                {/* Order summary */}
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between text-sm'>
                                        <span className='text-gray-500'>Subtotal</span>
                                        <span className='font-medium'>{formatPrice(totalPrice)}</span>
                                    </div>
                                    {appliedPromo && (
                                        <div className='flex items-center justify-between text-sm text-green-600'>
                                            <span>Promo ({appliedPromo.code})</span>
                                            <span className='font-medium'>-{formatPrice(promoDiscountAmount)}</span>
                                        </div>
                                    )}
                                    <div className='flex items-center justify-between text-sm'>
                                        <span className='text-gray-500'>Shipping</span>
                                        <span className='font-medium'>
                                            {remainingForFreeShipping > 0 ? 'Calculated at checkout' : 'FREE'}
                                        </span>
                                    </div>
                                </div>

                                <div className='border-t pt-4'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <span className='font-medium text-lg'>Total</span>
                                        <div className='text-right'>
                                            {appliedPromo && (
                                                <p className='text-xs text-gray-400 line-through'>{formatPrice(totalPrice)}</p>
                                            )}
                                            <span className='font-bold text-lg'>{formatPrice(discountedTotal)}</span>
                                        </div>
                                    </div>

                                    <button
                                        className='w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-900 transition-colors flex items-center justify-center'
                                        onClick={handleProceedToCheckout}
                                        disabled={loadingProceed}
                                    >
                                        {loadingProceed ? (
                                            <div className='flex items-center gap-1'>
                                                Navigating to checkout...
                                                <Loader2 className='w-4 h-4 animate-spin' />
                                            </div>
                                        ) : 'Proceed to Checkout'}
                                    </button>

                                    <div className='mt-4 space-y-2'>
                                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                                            <span>🔒</span>
                                            <span>Secure checkout</span>
                                        </div>
                                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                                            <span>🔄</span>
                                            <span>30-day returns</span>
                                        </div>
                                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                                            <span>💳</span>
                                            <span>All major payment methods accepted</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;
