import { getAllUsers } from "@/actions/admin-actions";
import { getAllOrders } from "@/actions/order-actions";
import { getAllApplications } from "@/actions/seller-application-actions";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [users, orders, applications] = await Promise.all([
    getAllUsers(),
    getAllOrders(),
    getAllApplications(),
  ]);

  const revenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const sellers = users.filter((u) => u.role === "seller").length;
  const pendingApplications = applications.filter((a) => a.status === "PENDING").length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Sellers" value={sellers} />
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Revenue (RM)" value={revenue.toFixed(2)} />
      </div>

      {pendingApplications > 0 && (
        <Link
          href="/dashboard/admin/applications"
          className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-8 hover:bg-yellow-100 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-yellow-900">
              {pendingApplications} pending seller application{pendingApplications > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">Review and approve or reject</p>
          </div>
          <span className="text-yellow-700 text-sm font-semibold">Review →</span>
        </Link>
      )}

      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4">Order ID</th>
                <th className="pb-2 pr-4">Customer</th>
                <th className="pb-2 pr-4">Total</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order._id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono text-xs">#{order.orderNumber}</td>
                  <td className="py-2 pr-4 text-gray-600">{order.customerEmail ?? "—"}</td>
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
