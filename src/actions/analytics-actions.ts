"use server";

import { getCurrentSession } from "@/actions/auth";
import { client } from "@/sanity/lib/client";

type RawItem = {
  quantity: number | null;
  price: number | null;
  productId: string | null;
  productTitle: string | null;
  sellerId: string | null;
};

type RawOrder = {
  _id: string;
  orderDate: string | null;
  totalPrice: number | null;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  orderItems: RawItem[] | null;
};

export type DayPoint = { date: string; revenue: number; orders: number };
export type ProductStat = { title: string; units: number; revenue: number };
export type StatusStat = { status: string; count: number };

export type DashboardAnalytics = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  unitsSold: number;
  revenueDeltaPct: number | null;
  revenueByDay: DayPoint[];
  topProducts: ProductStat[];
  statusBreakdown: StatusStat[];
};

const ANALYTICS_FIELDS = `
  _id,
  orderDate,
  totalPrice,
  status,
  orderItems[]{
    quantity,
    price,
    "productId": product->_id,
    "productTitle": product->title,
    "sellerId": product->sellerId
  }
`;

const WINDOW_DAYS = 14;
const MS_DAY = 86_400_000;
const STATUS_ORDER = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

/**
 * Reduce a set of orders into the numbers the dashboard renders. When `sellerId`
 * is passed, revenue/units/top-products are computed from *only* that seller's
 * line items (an order can contain items from several sellers); for admin
 * (`sellerId` undefined) the whole order counts.
 */
function computeAnalytics(orders: RawOrder[], sellerId?: string): DashboardAnalytics {
  const active = orders.filter((o) => o.status !== "CANCELLED");

  const itemsFor = (o: RawOrder) => {
    const items = o.orderItems ?? [];
    return sellerId ? items.filter((i) => i.sellerId === sellerId) : items;
  };

  const orderRevenue = (o: RawOrder) =>
    sellerId
      ? itemsFor(o).reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 0), 0)
      : o.totalPrice ?? 0;

  const totalRevenue = active.reduce((s, o) => s + orderRevenue(o), 0);
  const totalOrders = orders.length;
  const avgOrderValue = active.length ? totalRevenue / active.length : 0;
  const unitsSold = active.reduce(
    (s, o) => s + itemsFor(o).reduce((q, i) => q + (i.quantity ?? 0), 0),
    0
  );

  // Revenue by day — last WINDOW_DAYS UTC days, always fully populated so the
  // chart has a continuous x-axis even on days with no sales.
  const todayStart = Math.floor(Date.now() / MS_DAY) * MS_DAY;
  const byDay: DayPoint[] = [];
  const dayIndex = new Map<string, number>();
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const key = new Date(todayStart - i * MS_DAY).toISOString().slice(0, 10);
    dayIndex.set(key, byDay.length);
    byDay.push({ date: key, revenue: 0, orders: 0 });
  }
  for (const o of active) {
    const key = o.orderDate?.slice(0, 10);
    const idx = key ? dayIndex.get(key) : undefined;
    if (idx !== undefined) {
      byDay[idx].revenue += orderRevenue(o);
      byDay[idx].orders += 1;
    }
  }

  // Week-over-week delta within the window (last 7 days vs the 7 before).
  const prev7 = byDay.slice(0, 7).reduce((s, d) => s + d.revenue, 0);
  const last7 = byDay.slice(7).reduce((s, d) => s + d.revenue, 0);
  const revenueDeltaPct = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : null;

  // Top products by revenue.
  const productMap = new Map<string, ProductStat>();
  for (const o of active) {
    for (const i of itemsFor(o)) {
      const key = i.productId ?? i.productTitle ?? "unknown";
      const entry = productMap.get(key) ?? {
        title: i.productTitle ?? "Untitled product",
        units: 0,
        revenue: 0,
      };
      entry.units += i.quantity ?? 0;
      entry.revenue += (i.price ?? 0) * (i.quantity ?? 0);
      productMap.set(key, entry);
    }
  }
  const topProducts = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Status breakdown across *all* orders (cancelled included).
  const statusCounts = new Map<string, number>();
  for (const o of orders) {
    statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
  }
  const statusBreakdown = STATUS_ORDER.map((status) => ({
    status,
    count: statusCounts.get(status) ?? 0,
  }));

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    unitsSold,
    revenueDeltaPct,
    revenueByDay: byDay,
    topProducts,
    statusBreakdown,
  };
}

export async function getSellerAnalytics(): Promise<DashboardAnalytics> {
  const { user } = await getCurrentSession();
  if (!user) return computeAnalytics([], undefined);

  const orders = await client.fetch<RawOrder[]>(
    `*[_type == "order" && count(orderItems[product->sellerId == $sellerId]) > 0]{ ${ANALYTICS_FIELDS} }`,
    { sellerId: user.id },
    { cache: "no-store" }
  );

  return computeAnalytics(orders ?? [], user.id);
}

export async function getAdminAnalytics(): Promise<DashboardAnalytics> {
  const { user } = await getCurrentSession();
  if (!user) return computeAnalytics([], undefined);

  const role = (user as { role?: string }).role;
  if (role !== "admin") return computeAnalytics([], undefined);

  const orders = await client.fetch<RawOrder[]>(
    `*[_type == "order"]{ ${ANALYTICS_FIELDS} }`,
    {},
    { cache: "no-store" }
  );

  return computeAnalytics(orders ?? [], undefined);
}
