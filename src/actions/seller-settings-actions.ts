"use server";

import { getCurrentSession } from "@/actions/auth";
import { getSellerBrand } from "@/sanity/lib/client";
import { sellerSettingsSchema } from "@/lib/validation";

const WRITE_CLIENT_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-05-08",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
};

let _writeClient: ReturnType<typeof import("next-sanity").createClient> | null = null;

async function getWriteClient() {
  if (_writeClient) return _writeClient;
  const { createClient } = await import("next-sanity");
  _writeClient = createClient(WRITE_CLIENT_CONFIG);
  return _writeClient;
}

export type SellerSettings = {
  sellerName: string;
  defaultShippingPrice: number;
};

export async function getSellerSettings(): Promise<
  { error: string } | { settings: SellerSettings; brandId: string }
> {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const brand = await getSellerBrand(user.id);
  if (!brand) return { error: "No brand linked to your account" };

  return {
    settings: {
      sellerName: brand.sellerName ?? "",
      defaultShippingPrice: brand.defaultShippingPrice ?? 0,
    },
    brandId: brand._id,
  };
}

export async function updateSellerSettings(data: SellerSettings) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const role = (user as { role?: string }).role;
  if (role !== "seller" && role !== "admin")
    return { error: "Not authorized" };

  const parsed = sellerSettingsSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid seller settings" };

  const valid = parsed.data;

  const brand = await getSellerBrand(user.id);
  if (!brand) return { error: "No brand linked to your account" };

  const writeClient = await getWriteClient();
  await writeClient
    .patch(brand._id)
    .set({
      sellerName: valid.sellerName,
      defaultShippingPrice: valid.defaultShippingPrice,
    })
    .commit();

  return { success: true };
}
