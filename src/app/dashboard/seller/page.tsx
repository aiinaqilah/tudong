import Link from "next/link";
import { getSellerProducts } from "@/actions/product-actions";
import { getSellerOrders } from "@/actions/order-actions";

export default async function SellerDashboardPage() {
  const [products, orders] = await Promise.all([
    getSellerProducts(),
    getSellerOrders(),
  ]);

  const revenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Seller Overview</h1>
        <Link
          href="/dashboard/seller/products/new"
          className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          + New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Revenue (RM)" value={revenue.toFixed(2)} />
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4">Order ID</th>
                <th className="pb-2 pr-4">Total</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order._id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono text-xs">#{order.orderNumber}</td>
                  <td className="py-2 pr-4">RM {order.totalPrice.toFixed(2)}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-2 text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
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

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
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
