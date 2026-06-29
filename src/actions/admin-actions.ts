"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/actions/auth";
import prisma from "@/lib/db";

export async function getAllUsers() {
  const { user } = await getCurrentSession();
  if (!user) return [];

  const role = (user as { role?: string }).role;
  if (role !== "admin") return [];

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUserRole(userId: string, formData: FormData): Promise<void> {
  const { user } = await getCurrentSession();
  if (!user) return;

  const role = (user as { role?: string }).role;
  if (role !== "admin") return;

  const newRole = formData.get("role") as string;
  const validRoles = ["user", "seller", "admin"];
  if (!validRoles.includes(newRole)) return;

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/dashboard/admin/users");
}
