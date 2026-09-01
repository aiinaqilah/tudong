import Link from "next/link";
import { notFound } from "next/navigation";
import { getSellerOrderById, updateOrderStatus, updateTrackingInfo } from "@/actions/order-actions";

const STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getSellerOrderById(id);
  if (!order) notFound();

  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = subtotal > order.totalPrice ? subtotal - order.totalPrice : 0;

  const orderedAt = new Date(order.orderDate);

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard/seller/orders"
        className="text-sm text-gray-500 hover:text-gray-700 mb-5 inline-block"
      >
        ← Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{" "}
            {orderedAt.toLocaleDateString("en-MY", { dateStyle: "long" })} at{" "}
            {orderedAt.toLocaleTimeString("en-MY", { timeStyle: "short" })}
          </p>
        </div>
        <StatusBadge status={order.status} large />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wide">
            Customer
          </p>
          <p className="text-sm font-medium">{order.customerName ?? "—"}</p>
          <p className="text-sm text-gray-500 break-all">
            {order.customerEmail ?? "—"}
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wide">
            Payment
          </p>
          <p className="text-sm font-medium">Online Payment (Stripe)</p>
          <p className="text-sm font-medium text-green-600">Paid</p>
          {order.stripePaymentIntentId && (
            <p className="text-xs text-gray-400 mt-1 font-mono truncate">
              {order.stripePaymentIntentId}
            </p>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wide">
            Ship To
          </p>
          {order.shippingAddress ? (
            <div className="text-sm text-gray-700 space-y-0.5">
              {order.shippingAddress.name && (
                <p className="font-medium">{order.shippingAddress.name}</p>
              )}
              {order.shippingAddress.line1 && (
                <p>{order.shippingAddress.line1}</p>
              )}
              {order.shippingAddress.line2 && (
                <p>{order.shippingAddress.line2}</p>
              )}
              <p>
                {[
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.shippingAddress.country && (
                <p>{order.shippingAddress.country}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No address provided</p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-sm font-semibold">Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 text-xs">
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium text-right">Qty</th>
              <th className="px-4 py-2 font-medium text-right">Unit Price</th>
              <th className="px-4 py-2 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item) => (
              <tr key={item._key} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  {item.productTitle ?? item.product?._ref ?? "—"}
                  {item.size ? ` (${item.size})` : ""}
                </td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">
                  RM {item.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  RM {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>RM {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>−RM {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>RM {order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping tracking */}
      <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <h2 className="text-sm font-semibold mb-1">Shipping Tracking</h2>
        <p className="text-xs text-gray-400 mb-4">
          Enter the tracking number and/or link. Customers will see both once saved.
        </p>

        <form action={updateTrackingInfo.bind(null, order._id)} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="trackingNumber"
              defaultValue={order.trackingNumber ?? ""}
              placeholder="e.g. EE123456789MY"
              className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 min-w-0 font-mono uppercase placeholder:normal-case placeholder:font-sans"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="url"
              name="trackingUrl"
              defaultValue={order.trackingUrl ?? ""}
              placeholder="https://track.poslaju.com.my/..."
              className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 min-w-0"
            />
          </div>
          <button
            type="submit"
            className="text-sm bg-gray-900 text-white rounded px-4 py-1.5 hover:bg-gray-700"
          >
            Save
          </button>
        </form>
      </div>

      {/* Update status */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Update Status</h2>
        <form
          action={updateOrderStatus.bind(null, order._id)}
          className="flex items-center gap-3"
        >
          <select
            name="status"
            defaultValue={order.status}
            className="text-sm border border-gray-300 rounded px-3 py-1.5"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="text-sm bg-gray-900 text-white rounded px-4 py-1.5 hover:bg-gray-700"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status: s, large }: { status: string; large?: boolean }) {
  const colors: Record<string, string> = {
    PROCESSING: "bg-yellow-100 text-yellow-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`rounded-full font-medium ${colors[s] ?? "bg-gray-100 text-gray-700"} ${large ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}
    >
      {s}
    </span>
  );
}
