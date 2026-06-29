import { getCurrentSession } from "@/actions/auth";
import { getUserOrders } from "@/actions/order-actions";
import { getUserFavorites } from "@/actions/favorite-actions";
import { getMyApplication } from "@/actions/seller-application-actions";
import Link from "next/link";

export default async function UserDashboardPage() {
  const { user } = await getCurrentSession();
  const role = (user as { role?: string } | null)?.role ?? "user";
  const [orders, favorites, application] = await Promise.all([
    getUserOrders(),
    getUserFavorites(),
    role === "user" ? getMyApplication() : Promise.resolve(null),
  ]);

  const processing = orders.filter((o) => o.status === "PROCESSING").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const totalSpent = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-4xl">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 mb-8 text-white">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
          Welcome back
        </p>
        <h1 className="text-2xl font-bold font-heading">{firstName} 👋</h1>
        <p className="text-gray-300 text-sm mt-1">{user?.email}</p>
      </div>

      {/* Seller application banner — only for regular users */}
      {role === "user" && (
        <div className={`mb-6 rounded-xl border px-5 py-4 flex items-center justify-between gap-4 ${
          application?.status === "PENDING"
            ? "bg-yellow-50 border-yellow-200"
            : application?.status === "REJECTED"
            ? "bg-red-50 border-red-200"
            : "bg-gray-50 border-gray-200"
        }`}>
          <div>
            {!application && (
              <>
                <p className="text-sm font-semibold text-gray-800">Want to sell on TUDONG.COM?</p>
                <p className="text-xs text-gray-500 mt-0.5">Apply to become a seller and list your products.</p>
              </>
            )}
            {application?.status === "PENDING" && (
              <>
                <p className="text-sm font-semibold text-yellow-800">Application under review</p>
                <p className="text-xs text-yellow-600 mt-0.5">We'll notify you once your seller application is approved.</p>
              </>
            )}
            {application?.status === "REJECTED" && (
              <>
                <p className="text-sm font-semibold text-red-800">Application not approved</p>
                <p className="text-xs text-red-600 mt-0.5">You may update your application and resubmit.</p>
              </>
            )}
          </div>
          {(!application || application.status === "REJECTED") && (
            <Link
              href="/dashboard/user/apply-seller"
              className="shrink-0 bg-black text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              {application?.status === "REJECTED" ? "Reapply" : "Apply Now"}
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={orders.length} accent={false} />
        <StatCard label="Processing" value={processing} accent={false} />
        <StatCard label="Delivered" value={delivered} accent={false} />
        <StatCard label="Favourites" value={favorites.length} accent={true} />
      </div>

      {/* Total spent */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Total Spent</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            RM {totalSpent.toFixed(2)}
          </p>
        </div>
        <Link
          href="/dashboard/user/orders"
          className="text-xs font-semibold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
        >
          View All Orders →
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Recent Orders
          </h2>
          <Link
            href="/dashboard/user/orders"
            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            See all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-gray-400 text-sm">No orders yet.</p>
            <Link
              href="/"
              className="inline-block mt-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full hover:brightness-110 transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.orderItems.length}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      RM {order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(order.orderDate).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: boolean }) {
  return (
    <div className={`border rounded-xl p-4 ${accent ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? "text-red-500" : "text-gray-900"}`}>
        {value}
      </p>
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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
