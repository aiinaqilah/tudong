import Link from "next/link";
import { getSellerOrders, updateOrderStatus } from "@/actions/order-actions";

const STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function SellerOrdersPage() {
  const orders = await getSellerOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4">Order ID</th>
                <th className="pb-2 pr-4">Customer</th>
                <th className="pb-2 pr-4">Items</th>
                <th className="pb-2 pr-4">Total</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Update</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-mono text-xs">#{order.orderNumber}</td>
                  <td className="py-3 pr-4 text-gray-600">{order.customerEmail ?? "—"}</td>
                  <td className="py-3 pr-4">{order.orderItems.length}</td>
                  <td className="py-3 pr-4">RM {order.totalPrice.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    <form action={updateOrderStatus.bind(null, order._id)}>
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="text-xs border border-gray-300 rounded px-2 py-1 mr-2"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs underline text-gray-700">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/dashboard/seller/orders/${order._id}`}
                      className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status: s }: { status: string }) {
  const colors: Record<string, string> = {
    PROCESSING: "bg-yellow-100 text-yellow-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[s] ?? "bg-gray-100 text-gray-700"}`}>
      {s}
    </span>
  );
}
