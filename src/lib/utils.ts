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

export type ActiveCampaign = {
  _id: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  productRefs: string[] | null;
};

export function computeCampaignMap(
  products: { _id: string; price?: number | null }[],
  campaigns: ActiveCampaign[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const product of products) {
    const originalPrice = product.price ?? 0;
    let bestPrice = originalPrice;
    for (const campaign of campaigns) {
      if (campaign.productRefs?.includes(product._id)) {
        const discounted = campaign.discountType === 'percentage'
          ? originalPrice * (1 - campaign.discountValue / 100)
          : originalPrice - campaign.discountValue;
        if (discounted < bestPrice) bestPrice = Math.max(0, discounted);
      }
    }
    if (bestPrice < originalPrice) {
      map.set(product._id, bestPrice);
    }
  }
  return map;
}