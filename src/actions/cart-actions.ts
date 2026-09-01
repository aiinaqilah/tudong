"use server";

import { getCurrentSession } from "@/actions/auth";
import prisma from "@/lib/prisma";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { revalidatePath } from "next/cache";
import { cartItemSchema } from "@/lib/validation";

export const createCart = async () => {
    const { user } = await getCurrentSession();

    const cart = await prisma.cart.create({
        data: {
            id: crypto.randomUUID(),
            user: user ? { connect: { id: user.id } } : undefined,
            items: {
                create: [],
            }
        },
        include: {
            items: true,
        }
    });

    return cart;
}

export const getOrCreateCart = async (cartId?: string | null) => {
    const { user } = await getCurrentSession();

    if(user) {
        const userCart = await prisma.cart.findUnique({
            where: {
                userId: user.id,
            },
            include: {
                items: true,
            }
        });

        if(userCart) {
            return userCart;
        }
    }

    if(!cartId) {
        return createCart();
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
        return createCart();
    }

    return cart;
}

export const updateCartItem = async (
    cartId: string,
    sanityProductId: string,
    data: {
        title?: string,
        price?: number,
        image?: string,
        quantity?: number,
    },
    size?: string | null
) => {
    const parsed = cartItemSchema.safeParse({
        cartId,
        sanityProductId,
        data,
        size,
    });
    if (!parsed.success) return null;

    const valid = parsed.data;
    const cartIdValid = valid.cartId;
    const sanityProductIdValid = valid.sanityProductId;
    const dataValid = valid.data;

    const cart = await getOrCreateCart(cartIdValid);

    const existingItem = cart.items.find(
        (item: { sanityProductId: string; size: string | null }) =>
            sanityProductIdValid === item.sanityProductId &&
            (item.size ?? null) === (valid.size ?? null)
    );

    if(existingItem) {
        if(dataValid.quantity === 0) {
            await prisma.cartLineItem.delete({
                where: { id: existingItem.id }
            });
        } else if(dataValid.quantity && dataValid.quantity > 0) {
            await prisma.cartLineItem.update({
                where: { id: existingItem.id },
                data: { quantity: dataValid.quantity }
            });
        }
    } else if(dataValid.quantity && dataValid.quantity > 0) {
        await prisma.cartLineItem.create({
            data: {
                id: crypto.randomUUID(),
                cartId: cart.id,
                sanityProductId: sanityProductIdValid,
                quantity: dataValid.quantity || 1,
                title: dataValid.title || '',
                price: dataValid.price || 0,
                image: dataValid.image || '',
                size: valid.size ?? null,
            }
        });
    }

    revalidatePath("/");
    return getOrCreateCart(cartIdValid);
}

export const syncCartWithUser = async (cartId: string | null) => {
    const { user } = await getCurrentSession();

    if(!user) {
        return null;
    }

    const existingUserCart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: { items: true }
    });

    const existingAnonymousCart = cartId ? await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: true }
    }) : null;

    if(!cartId && existingUserCart) {
        return existingUserCart;
    }

    if(!cartId) {
        return createCart();
    }

    if(!existingAnonymousCart && !existingUserCart) {
        return createCart();
    }

    if(existingUserCart && existingUserCart.id === cartId) {
        return existingUserCart;
    }

    if(!existingUserCart) {
        return prisma.cart.update({
            where: { id: cartId },
            data: { user: { connect: { id: user.id } } },
            include: { items: true }
        });
    }

    if(!existingAnonymousCart) {
        return existingUserCart;
    }

    for(const item of existingAnonymousCart.items) {
        const existingItem = existingUserCart.items.find(
            (i: { sanityProductId: string; size: string | null }) =>
                i.sanityProductId === item.sanityProductId &&
                (i.size ?? null) === (item.size ?? null)
        );

        if(existingItem) {
            await prisma.cartLineItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + item.quantity }
            });
        } else {
            await prisma.cartLineItem.create({
                data: {
                    id: crypto.randomUUID(),
                    cartId: existingUserCart.id,
                    sanityProductId: item.sanityProductId,
                    quantity: item.quantity,
                    title: item.title,
                    price: item.price,
                    image: item.image,
                    size: item.size ?? null,
                }
            });
        }
    }

    await prisma.cart.delete({ where: { id: cartId } });

    revalidatePath("/");
    return getOrCreateCart(existingUserCart.id);
}

export const addWinningItemToCart = async (cartId: string, product: Product) => {
    const cart = await getOrCreateCart(cartId);

    return updateCartItem(cart.id, product._id, {
        title: `🎁 ${product.title} (Won)`,
        price: 0,
        image: product.image ? urlFor(product.image).url() : '',
        quantity: 1,
    });
}
