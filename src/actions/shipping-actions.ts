"use server";

import { client } from "@/sanity/lib/client";

export type SellerShippingInfo = {
  sellerId: string;
  sellerName: string | null;
  shippingCost: number;
};

export type ProductShippingData = {
  _id: string;
  sellerId: string;
  shippingOverride: number | null;
  brand: {
    _id: string;
    defaultShippingPrice: number;
    sellerName: string | null;
  } | null;
};

const SHIPPING_QUERY = `*[_type == "product" && _id in $productIds]{
  _id,
  sellerId,
  shippingOverride,
  brand->{
    _id,
    defaultShippingPrice,
    sellerName
  }
}`;

export async function getShippingForProducts(
  productIds: string[]
): Promise<SellerShippingInfo[]> {
  if (productIds.length === 0) return [];

  const products = await client.fetch<ProductShippingData[]>(
    SHIPPING_QUERY,
    { productIds },
    { cache: "no-store" }
  );

  const sellerMap = new Map<
    string,
    { sellerName: string | null; shippingCost: number }
  >();

  for (const product of products) {
    const sellerId = product.sellerId;
    if (!sellerId) continue;

    const cost =
      product.shippingOverride ??
      product.brand?.defaultShippingPrice ??
      0;

    const existing = sellerMap.get(sellerId);
    if (existing) {
      existing.shippingCost += cost;
    } else {
      sellerMap.set(sellerId, {
        sellerName: product.brand?.sellerName ?? null,
        shippingCost: cost,
      });
    }
  }

  return Array.from(sellerMap.entries()).map(
    ([sellerId, { sellerName, shippingCost }]) => ({
      sellerId,
      sellerName,
      shippingCost,
    })
  );
}
