"use server";

import { getCurrentSession } from "@/actions/auth";
import { client } from "@/sanity/lib/client";
import prisma from "@/lib/db";
import { sendShippedEmail, sendOrderCompleteEmail } from "@/lib/email";

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
    `*[_type == "order" && sellerId == $sellerId] | order(orderDate desc){
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
    `*[_type == "order" && _id == $orderId && sellerId == $sellerId][0]{ ${ORDER_DETAIL_FIELDS} }`,
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
      `{ "count": count(*[_type == "order" && _id == $orderId && sellerId == $sellerId]) }`,
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

  if (status === "SHIPPED") {
    try {
      const order = await client.fetch<{
        orderNumber: string;
        customerEmail: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
      }>(
        `*[_type == "order" && _id == $orderId][0]{ orderNumber, customerEmail, trackingNumber, trackingUrl }`,
        { orderId },
        { cache: "no-store" }
      );
      if (order?.customerEmail) {
        await sendShippedEmail({
          to: order.customerEmail,
          orderNumber: order.orderNumber,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
        });
      }
    } catch {
      // email failure should not break the status update
    }
  }
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

  try {
    const order = await client.fetch<{
      orderNumber: string;
      customerName: string | null;
      sellerIds: (string | null)[];
    }>(
      `*[_type == "order" && _id == $orderId][0]{
        orderNumber,
        customerName,
        "sellerIds": orderItems[].product->sellerId
      }`,
      { orderId },
      { cache: "no-store" }
    );

    const uniqueSellerIds = [...new Set((order?.sellerIds ?? []).filter(Boolean))] as string[];

    if (uniqueSellerIds.length) {
      const sellers = await prisma.user.findMany({
        where: { id: { in: uniqueSellerIds } },
        select: { email: true },
      });
      await Promise.all(
        sellers.map((seller) =>
          sendOrderCompleteEmail({
            to: seller.email,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
          })
        )
      );
    }
  } catch {
    // email failure should not break the delivery confirmation
  }
}

export async function getSellerPendingOrderCount(): Promise<number> {
  const { user } = await getCurrentSession();
  if (!user) return 0;

  const role = (user as { role?: string }).role;
  if (role !== "seller" && role !== "admin") return 0;

  const result = await client.fetch<{ count: number }>(
    `{ "count": count(*[_type == "order" && status == "PROCESSING" && sellerId == $sellerId]) }`,
    { sellerId: user.id },
    { cache: "no-store" }
  );

  return result?.count ?? 0;
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
      `{ "count": count(*[_type == "order" && _id == $orderId && sellerId == $sellerId]) }`,
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
