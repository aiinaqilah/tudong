"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/actions/auth";
import prisma from "@/lib/db";
import { createClient } from "next-sanity";
import { sellerApplicationSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function submitSellerApplication(formData: FormData) {
  const { user } = await getCurrentSession();
  if (!user) return { error: "Not authenticated" };

  const role = (user as { role?: string }).role ?? "customer";
  if (role !== "customer" && role !== "user") return { error: "Only customers can apply to become a seller" };

  if (!rateLimit(`user:${user.id}:apply-seller`, 3, 60_000).allowed) {
    return { error: "Too many attempts. Please try again shortly." };
  }

  const parsed = sellerApplicationSchema.safeParse({
    brandName: formData.get("brandName"),
    description: formData.get("description"),
    instagram: formData.get("instagram"),
    website: formData.get("website"),
  });

  if (!parsed.success) return { error: "Invalid application details" };

  const { brandName, description, instagram, website } = parsed.data;

  const existing = await prisma.sellerApplication.findUnique({ where: { userId: user.id } });
  if (existing) {
    if (existing.status === "PENDING") return { error: "You already have a pending application" };
    if (existing.status === "APPROVED") return { error: "Your application was already approved" };
    // REJECTED — allow re-apply by updating
    await prisma.sellerApplication.update({
      where: { userId: user.id },
      data: { brandName, description, instagram, website, status: "PENDING" },
    });
    revalidatePath("/dashboard/customer");
    return { success: true };
  }

  await prisma.sellerApplication.create({
    data: { userId: user.id, brandName, description, instagram, website },
  });

  revalidatePath("/dashboard/customer");
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

  // Create brand document in Sanity
  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });

  const slug = application.brandName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  await sanityClient.create({
    _type: "brand",
    name: application.brandName,
    slug: { _type: "slug", current: slug },
    description: application.description,
    sellerId: application.userId,
  });

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
