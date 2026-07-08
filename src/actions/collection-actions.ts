"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/actions/auth";
import { client } from "@/sanity/lib/client";
import {
  getSellerCollections,
  createSellerCollection,
  deleteSellerCollection,
} from "@/sanity/lib/client";

export async function getMyCollections() {
  const { user } = await getCurrentSession();
  if (!user) return [];
  return getSellerCollections(user.id);
}

export async function createCollection(formData: FormData) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const title = (formData.get("title") as string).trim();
  if (!title) return { error: "Title is required" };

  const description = (formData.get("description") as string | null)?.trim() || undefined;

  try {
    await createSellerCollection({ title, description, sellerId: user.id });
    revalidatePath("/dashboard/seller/collections");
    return { success: true };
  } catch {
    return { error: "Failed to create collection" };
  }
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const { user } = await getCurrentSession();
  if (!user) return;

  const result = await client.fetch<{ count: number }>(
    `{ "count": count(*[_type == "collection" && _id == $collectionId && sellerId == $sellerId]) }`,
    { collectionId, sellerId: user.id },
    { cache: "no-store" }
  );
  if (!result?.count) return;

  await deleteSellerCollection(collectionId);
  revalidatePath("/dashboard/seller/collections");
}
