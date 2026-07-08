"use server";

import { getCurrentSession } from "@/actions/auth";
import { client } from "@/sanity/lib/client";

export type SanityOrderItem = {
  _key: string;
  product: { _ref: string; _type: "reference" } | null;
  quantity: number;
  price: number;
  productTitle?: string;
};

export type SanityOrder = {
  _id: string;
  orderNumber: string;
  orderDate: string;
  totalPrice: number;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  customerEmail: string | null;
  customerName: string | null;
  shippingAddress: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  orderItems: SanityOrderItem[];
  trackingNumber: string | null;
  trackingUrl: string | null;
};

export type SanityOrderDetail = SanityOrder & {
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
};

const ORDER_FIELDS = `
  _id,
  orderNumber,
  orderDate,
  totalPrice,
  status,
  customerEmail,
  customerName,
  shippingAddress,
  orderItems[]{
    _key,
    product,
    quantity,
    price,
    "productTitle": product->title
  },
  trackingNumber,
  trackingUrl
`;

const ORDER_DETAIL_FIELDS = `
  ${ORDER_FIELDS},
  stripePaymentIntentId,
  stripeCheckoutSessionId
`;

export async function getUserOrders(): Promise<SanityOrder[]> {
  const { user } = await getCurrentSession();
  if (!user) return [];

  return client.fetch(
    `*[_type == "order" && customerId == $userId] | order(orderDate desc){ ${ORDER_FIELDS} }`,
    { userId: user.id },
    { cache: "no-store" }
  );
}

export async function getSellerOrders(): Promise<SanityOrder[]> {
  const { user } = await getCurrentSession();
  if (!user) return [];

  return client.fetch(
    `*[_type == "order" && count(orderItems[product->sellerId == $sellerId]) > 0] | order(orderDate desc){
      ${ORDER_FIELDS},
      "customer": { "email": customerEmail, "name": customerName }
    }`,
    { sellerId: user.id },
    { cache: "no-store" }
  );
}

export async function getAllOrders(): Promise<SanityOrder[]> {
  const { user } = await getCurrentSession();
  if (!user) return [];

  const role = (user as { role?: string }).role;
  if (role !== "admin") return [];

  return client.fetch(
    `*[_type == "order"] | order(orderDate desc){ ${ORDER_FIELDS} }`,
    {},
    { cache: "no-store" }
  );
}

export async function getSellerOrderById(orderId: string): Promise<SanityOrderDetail | null> {
  const { user } = await getCurrentSession();
  if (!user) return null;

  const role = (user as { role?: string }).role;

  if (role === "admin") {
    return client.fetch(
      `*[_type == "order" && _id == $orderId][0]{ ${ORDER_DETAIL_FIELDS} }`,
      { orderId },
      { cache: "no-store" }
    );
  }

  return client.fetch(
    `*[_type == "order" && _id == $orderId && count(orderItems[product->sellerId == $sellerId]) > 0][0]{ ${ORDER_DETAIL_FIELDS} }`,
    { orderId, sellerId: user.id },
    { cache: "no-store" }
  );
}

export async function updateOrderStatus(orderId: string, formData: FormData): Promise<void> {
  const { user } = await getCurrentSession();
  if (!user) return;

  const status = formData.get("status") as string;
  const validStatuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) return;

  const role = (user as { role?: string }).role;

  if (role !== "admin") {
    const result = await client.fetch<{ count: number }>(
      `{ "count": count(*[_type == "order" && _id == $orderId && count(orderItems[product->sellerId == $sellerId]) > 0]) }`,
      { orderId, sellerId: user.id },
      { cache: "no-store" }
    );
    if (!result?.count) return;
  }

  const { createClient } = await import("next-sanity");
  const { apiVersion, dataset, projectId } = await import("@/sanity/env");

  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });

  await writeClient.patch(orderId).set({ status }).commit();
}

export async function confirmOrderDelivered(orderId: string): Promise<void> {
  const { user } = await getCurrentSession();
  if (!user) return;

  // Confirm this order belongs to the logged-in customer and is currently SHIPPED
  const result = await client.fetch<{ count: number }>(
    `{ "count": count(*[_type == "order" && _id == $orderId && customerId == $userId && status == "SHIPPED"]) }`,
    { orderId, userId: user.id },
    { cache: "no-store" }
  );
  if (!result?.count) return;

  const { createClient } = await import("next-sanity");
  const { apiVersion, dataset, projectId } = await import("@/sanity/env");

  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });

  await writeClient.patch(orderId).set({ status: "DELIVERED" }).commit();
}

export async function updateTrackingInfo(orderId: string, formData: FormData): Promise<void> {
  const { user } = await getCurrentSession();
  if (!user) return;

  const trackingNumber = (formData.get("trackingNumber") as string).trim();
  const trackingUrl = (formData.get("trackingUrl") as string).trim();
  if (trackingUrl && !trackingUrl.startsWith("http")) return;

  const role = (user as { role?: string }).role;

  if (role !== "admin") {
    const result = await client.fetch<{ count: number }>(
      `{ "count": count(*[_type == "order" && _id == $orderId && count(orderItems[product->sellerId == $sellerId]) > 0]) }`,
      { orderId, sellerId: user.id },
      { cache: "no-store" }
    );
    if (!result?.count) return;
  }

  const { createClient } = await import("next-sanity");
  const { apiVersion, dataset, projectId } = await import("@/sanity/env");

  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });

  await writeClient.patch(orderId).set({
    trackingNumber: trackingNumber || null,
    trackingUrl: trackingUrl || null,
  }).commit();
}
