"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/actions/auth";
import prisma from "@/lib/db";

export async function submitSellerApplication(formData: FormData) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const role = (user as { role?: string }).role ?? "user";
  if (role !== "user") return { error: "Only regular users can apply to become a seller" };

  const brandName = (formData.get("brandName") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const instagram = (formData.get("instagram") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;

  if (!brandName || !description) return { error: "Brand name and description are required" };

  const existing = await prisma.sellerApplication.findUnique({ where: { userId: user.id } });
  if (existing) {
    if (existing.status === "PENDING") return { error: "You already have a pending application" };
    if (existing.status === "APPROVED") return { error: "Your application was already approved" };
    // REJECTED — allow re-apply by updating
    await prisma.sellerApplication.update({
      where: { userId: user.id },
      data: { brandName, description, instagram, website, status: "PENDING" },
    });
    revalidatePath("/dashboard/user");
    return { success: true };
  }

  await prisma.sellerApplication.create({
    data: { userId: user.id, brandName, description, instagram, website },
  });

  revalidatePath("/dashboard/user");
  return { success: true };
}

export async function getMyApplication() {
  const { user } = await getCurrentSession();
  if (!user) return null;
  return prisma.sellerApplication.findUnique({ where: { userId: user.id } });
}

export async function getAllApplications() {
  const { user } = await getCurrentSession();
  if (!user) return [];

  const role = (user as { role?: string }).role;
  if (role !== "admin") return [];

  return prisma.sellerApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function approveApplication(applicationId: string): Promise<void> {
  const { user } = await getCurrentSession();
  if (!user) return;

  const role = (user as { role?: string }).role;
  if (role !== "admin") return;

  const application = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
  });
  if (!application) return;

  await prisma.$transaction([
    prisma.sellerApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    }),
    prisma.user.update({
      where: { id: application.userId },
      data: { role: "seller" },
    }),
  ]);

  revalidatePath("/dashboard/admin/applications");
}

export async function rejectApplication(applicationId: string): Promise<void> {
  const { user } = await getCurrentSession();
  if (!user) return;

  const role = (user as { role?: string }).role;
  if (role !== "admin") return;

  await prisma.sellerApplication.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/dashboard/admin/applications");
}
