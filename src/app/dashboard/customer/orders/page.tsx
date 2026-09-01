import { getUserOrders, confirmOrderDelivered } from "@/actions/order-actions";
import Link from "next/link";
import ConfirmForm from "@/components/ui/ConfirmForm";

export default async function UserOrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
          Dashboard
        </p>
        <h1 className="text-2xl font-bold font-heading text-gray-900">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 text-sm mb-6">
            When you place an order, it will appear here.
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full hover:brightness-110 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Order header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                      Order ID
                    </p>
                    <p className="font-mono text-sm font-semibold text-gray-700">
                      #{order.orderNumber}
                    </p>
                  </div>
                  <div className="h-8 border-l border-gray-200" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                      Date
                    </p>
                    <p className="text-sm text-gray-700">
                      {new Date(order.orderDate).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="h-8 border-l border-gray-200" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                      Total
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      RM {order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Order items */}
              <div className="divide-y divide-gray-50">
                {order.orderItems.map((item) => (
                  <div
                    key={item._key}
                    className="px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productTitle ?? "Product"}
                        {item.size ? ` (${item.size})` : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qty: {item.quantity} × RM {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 shrink-0">
                      RM {(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping address */}
              {order.shippingAddress?.line1 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                  Ships to: {[
                    order.shippingAddress.line1,
                    order.shippingAddress.city,
                    order.shippingAddress.state,
                    order.shippingAddress.postalCode,
                  ].filter(Boolean).join(", ")}
                </div>
              )}

              {/* Tracking info + Order Received / Order Complete */}
              {(order.trackingNumber || order.trackingUrl || order.status === "SHIPPED" || order.status === "DELIVERED") && (
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    {order.trackingNumber && (
                      <span className="text-xs text-gray-500">
                        Tracking number:{" "}
                        <span className="font-mono text-gray-800">{order.trackingNumber}</span>
                      </span>
                    )}
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-full transition-colors"
                      >
                        Track Shipment ↗
                      </a>
                    )}
                  </div>

                  {order.status === "SHIPPED" && (
                    <ConfirmForm
                      action={confirmOrderDelivered.bind(null, order._id)}
                      confirmMessage="Have you received this order? This cannot be undone."
                    >
                      <button
                        type="submit"
                        className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-full transition-colors"
                      >
                        Order Received
                      </button>
                    </ConfirmForm>
                  )}
                  {order.status === "DELIVERED" && (
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">
                      Order Complete
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PROCESSING: "bg-yellow-100 text-yellow-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
