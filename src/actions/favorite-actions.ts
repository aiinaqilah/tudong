"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/actions/auth";
import prisma from "@/lib/db";

export async function getUserFavorites() {
  const { user } = await getCurrentSession();
  if (!user) return [];

  return prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function addFavorite(productId: string) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  await prisma.favorite.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    create: { userId: user.id, productId },
    update: {},
  });

  revalidatePath("/dashboard/user/favorites");
  return { success: true };
}

export async function removeFavorite(productId: string) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  await prisma.favorite.deleteMany({
    where: { userId: user.id, productId },
  });

  revalidatePath("/dashboard/user/favorites");
  return { success: true };
}

export async function removeFavoriteAction(formData: FormData) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const productId = formData.get("productId") as string;
  if (!productId) return { error: "Missing productId" };

  await prisma.favorite.deleteMany({
    where: { userId: user.id, productId },
  });

  revalidatePath("/dashboard/user/favorites");
}
