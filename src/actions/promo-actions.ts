"use server";

import { client } from "@/sanity/lib/client";

export type PromoResult =
  | { valid: true; code: string; discountType: "percentage" | "fixed"; discountValue: number }
  | { valid: false; error: string };

export async function validatePromoCode(code: string): Promise<PromoResult> {
  const now = new Date().toISOString();

  const promo = await client.fetch<{
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    usageLimit: number | null;
    usageCount: number;
  } | null>(
    `*[_type == "promotionCode" && code == $code && isActive == true && expiresAt > $now][0]{
      code,
      discountType,
      discountValue,
      usageLimit,
      usageCount
    }`,
    { code: code.trim().toUpperCase(), now },
    { cache: "no-store" }
  );

  if (!promo) {
    return { valid: false, error: "Invalid or expired promo code." };
  }

  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return { valid: false, error: "This promo code has reached its usage limit." };
  }

  return {
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
  };
}
