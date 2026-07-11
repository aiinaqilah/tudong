"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/actions/auth";
import {
  getSellerSanityProducts,
  getSanityProductById,
  createSanityProduct,
  deleteSanityProduct,
  updateSanityProduct,
  uploadProductImage,
} from "@/sanity/lib/client";

export async function createProduct(formData: FormData) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const role = (user as { role?: string }).role;
  if (role !== "seller" && role !== "admin") return { error: "Not authorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10) || 0;
  const inStock = formData.get("inStock") === "on";
  const categoryId = (formData.get("categoryId") as string) || undefined;
  const brandId = (formData.get("brandId") as string) || undefined;
  const materialId = (formData.get("materialId") as string) || undefined;
  const collectionId = (formData.get("collectionId") as string) || undefined;
  const sizeIds = formData.getAll("sizeIds") as string[];
  const colorsJson = formData.get("colors") as string;
  const colors: { name: string; hex: string }[] = colorsJson ? JSON.parse(colorsJson) : [];
  const shippingOverrideRaw = formData.get("shippingOverride") as string;
  const shippingOverride = shippingOverrideRaw !== "" ? parseFloat(shippingOverrideRaw) : undefined;

  // Upload images to Sanity
  const imageFiles = formData.getAll("images") as File[];
  const imageAssetIds: string[] = [];
  for (const file of imageFiles) {
    if (!file || file.size === 0) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const assetId = await uploadProductImage(buffer, file.name, file.type);
    imageAssetIds.push(assetId);
  }

  try {
    const product = await createSanityProduct({
      title,
      description,
      price,
      stock,
      inStock,
      sellerId: user.id,
      imageAssetIds,
      categoryId,
      brandId,
      materialId,
      collectionId,
      colors,
      sizeIds,
      shippingOverride,
    });

    revalidatePath("/dashboard/seller/products");
    return { product };
  } catch {
    return { error: "Failed to create product" };
  }
}

export async function getSellerProducts() {
  const { user } = await getCurrentSession();
  if (!user) return [];

  return getSellerSanityProducts(user.id);
}

export async function deleteProduct(productId: string): Promise<void> {
  const { user } = await getCurrentSession();
  if (!user) return;

  try {
    await deleteSanityProduct(productId);
    revalidatePath("/dashboard/seller/products");
  } catch {
    // silently fail — product may not exist
  }
}

export async function getSellerProduct(productId: string) {
  const { user } = await getCurrentSession();
  if (!user) return null;
  return getSanityProductById(productId, user.id);
}

export async function updateProduct(productId: string, formData: FormData) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const role = (user as { role?: string }).role;
  if (role !== "seller" && role !== "admin") return { error: "Not authorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10) || 0;
  const inStock = formData.get("inStock") === "on";
  const discountRaw = formData.get("discount") as string;
  const discount = discountRaw !== "" ? parseFloat(discountRaw) : null;
  const categoryId = (formData.get("categoryId") as string) || undefined;
  const materialId = (formData.get("materialId") as string) || undefined;
  const collectionId = (formData.get("collectionId") as string) || undefined;
  const sizeIds = formData.getAll("sizeIds") as string[];
  const colorsJson = formData.get("colors") as string;
  const colors: { name: string; hex: string }[] = colorsJson ? JSON.parse(colorsJson) : [];
  const keepImageKeys = formData.getAll("keepImageKeys") as string[];
  const existingImagesJson = formData.get("existingImages") as string;
  const existingImages: { _key: string; _ref: string }[] = existingImagesJson
    ? JSON.parse(existingImagesJson)
    : [];
  const shippingOverrideRaw = formData.get("shippingOverride") as string;
  const shippingOverride = shippingOverrideRaw !== "" ? parseFloat(shippingOverrideRaw) : null;

  const imageFiles = formData.getAll("images") as File[];
  const newImageAssetIds: string[] = [];
  for (const file of imageFiles) {
    if (!file || file.size === 0) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const assetId = await uploadProductImage(buffer, file.name, file.type);
    newImageAssetIds.push(assetId);
  }

  try {
    const updated = await updateSanityProduct(productId, {
      title,
      description,
      price,
      stock,
      inStock,
      discount,
      categoryId,
      materialId,
      collectionId,
      colors,
      sizeIds,
      newImageAssetIds,
      keepImageKeys,
      existingImages,
      shippingOverride,
    });
    revalidatePath("/dashboard/seller/products");
    return { product: updated };
  } catch {
    return { error: "Failed to update product" };
  }
}
