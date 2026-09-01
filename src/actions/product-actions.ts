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
import { createProductSchema, updateProductSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

function parseColorInput(raw: string): { name: string; hex: string }[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function createProduct(formData: FormData) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const role = (user as { role?: string }).role;
  if (role !== "seller" && role !== "admin") return { error: "Not authorized" };

  if (!rateLimit(`user:${user.id}:create-product`, 20, 60_000).allowed) {
    return { error: "Too many requests. Please try again shortly." };
  }

  const colors = parseColorInput(formData.get("colors") as string);

  const parsed = createProductSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price") as string),
    stock: parseInt(formData.get("stock") as string, 10) || 0,
    inStock: formData.get("inStock") === "on",
    categoryId: (formData.get("categoryId") as string) || undefined,
    brandId: (formData.get("brandId") as string) || undefined,
    materialId: (formData.get("materialId") as string) || undefined,
    collectionId: (formData.get("collectionId") as string) || undefined,
    sizeIds: formData.getAll("sizeIds") as string[],
    colors,
    shippingOverride:
      (formData.get("shippingOverride") as string) !== ""
        ? parseFloat(formData.get("shippingOverride") as string)
        : undefined,
  });

  if (!parsed.success) return { error: "Invalid product details" };

  const data = parsed.data;

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
      title: data.title,
      description: data.description,
      price: data.price,
      stock: data.stock,
      inStock: data.inStock,
      sellerId: user.id,
      imageAssetIds,
      categoryId: data.categoryId,
      brandId: data.brandId,
      materialId: data.materialId,
      collectionId: data.collectionId,
      colors: data.colors,
      sizeIds: data.sizeIds,
      shippingOverride: data.shippingOverride,
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

  if (!rateLimit(`user:${user.id}:update-product`, 30, 60_000).allowed) {
    return { error: "Too many requests. Please try again shortly." };
  }

  const colors = parseColorInput(formData.get("colors") as string);

  const parsed = updateProductSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price") as string),
    stock: parseInt(formData.get("stock") as string, 10) || 0,
    inStock: formData.get("inStock") === "on",
    discount:
      (formData.get("discount") as string) !== ""
        ? parseFloat(formData.get("discount") as string)
        : null,
    categoryId: (formData.get("categoryId") as string) || undefined,
    materialId: (formData.get("materialId") as string) || undefined,
    collectionId: (formData.get("collectionId") as string) || undefined,
    sizeIds: formData.getAll("sizeIds") as string[],
    colors,
    keepImageKeys: formData.getAll("keepImageKeys") as string[],
    existingImages: parseColorInputJson(formData.get("existingImages") as string),
    shippingOverride:
      (formData.get("shippingOverride") as string) !== ""
        ? parseFloat(formData.get("shippingOverride") as string)
        : null,
  });

  if (!parsed.success) return { error: "Invalid product details" };

  const data = parsed.data;

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
      title: data.title,
      description: data.description,
      price: data.price,
      stock: data.stock,
      inStock: data.inStock,
      discount: data.discount ?? null,
      categoryId: data.categoryId,
      materialId: data.materialId,
      collectionId: data.collectionId,
      colors: data.colors,
      sizeIds: data.sizeIds,
      newImageAssetIds,
      keepImageKeys: data.keepImageKeys ?? [],
      existingImages: data.existingImages ?? [],
      shippingOverride: data.shippingOverride ?? null,
    });
    revalidatePath("/dashboard/seller/products");
    return { product: updated };
  } catch {
    return { error: "Failed to update product" };
  }
}

function parseColorInputJson(raw: string): { _key: string; _ref: string }[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
