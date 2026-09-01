import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
    }).format(price);
}

const NEW_PRODUCT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/** True when a product was created within the last 14 days (based on Sanity's _createdAt). */
export function isNewProduct(createdAt?: string | null): boolean {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() < NEW_PRODUCT_WINDOW_MS;
}

/** Compute the effective discounted price from a seller-set discount percentage. */
export function getEffectivePrice(price: number | null | undefined, discount: number | null | undefined): number | undefined {
    if (!price || !discount || discount <= 0) return undefined;
    return Math.max(0, price * (1 - discount / 100));
}