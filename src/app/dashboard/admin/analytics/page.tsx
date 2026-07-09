import { getAdminAnalytics } from "@/actions/analytics-actions";
import { formatPrice } from "@/lib/utils";
import KpiCard from "@/components/analytics/KpiCard";
import ChartCard from "@/components/analytics/ChartCard";
import RevenueChart from "@/components/analytics/RevenueChart";
import TopProductsChart from "@/components/analytics/TopProductsChart";
import StatusDonut from "@/components/analytics/StatusDonut";

export default async function AdminAnalyticsPage() {
  const a = await getAdminAnalytics();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-0.5 text-sm text-gray-500">Marketplace-wide performance</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Revenue" value={formatPrice(a.totalRevenue)} deltaPct={a.revenueDeltaPct} />
        <KpiCard label="Orders" value={String(a.totalOrders)} />
        <KpiCard label="Avg. Order Value" value={formatPrice(a.avgOrderValue)} />
        <KpiCard label="Units Sold" value={String(a.unitsSold)} />
      </div>

      <div className="mb-6">
        <ChartCard title="Revenue" subtitle="Last 14 days">
          <RevenueChart data={a.revenueByDay} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Top Products" subtitle="By revenue">
          <TopProductsChart data={a.topProducts} />
        </ChartCard>
        <ChartCard title="Orders by Status">
          <StatusDonut data={a.statusBreakdown} />
        </ChartCard>
      </div>
    </div>
  );
}
