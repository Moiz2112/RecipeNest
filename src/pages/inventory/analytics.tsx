import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from '../../components/Loading';
import { BarChart, LineChart, PieChart } from '../../components/Inventory_Dashboard/Charts';

interface AnalyticsData {
  mostUsedIngredients: Array<{ name: string; count: number }>;
  leastUsedIngredients: Array<{ name: string; count: number }>;
  monthlyValue: { [key: string]: number };
  expiredItems: Array<{ name: string; value: number; expiryDate: string }>;
  wasteValue: number;
  consumptionTrend: { [key: string]: number };
  monthlyAdditions: { [key: string]: number };
  monthlyConsumptions: { [key: string]: number };
  totalSpending: number;
  totalTransactions: number;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Keep hooks stable; guard fetching by auth status
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchAnalytics();
  }, [status]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <Loading />;
  }

  const formatPKR = (n: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(n);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-neutral-900">Analytics</h1>
          <p className="text-neutral-600 mt-1">Detailed insights about your inventory usage</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
            <p className="text-neutral-600 text-sm font-medium mb-2">Total Spending</p>
            <p className="text-4xl font-bold text-neutral-900">{formatPKR(analytics.totalSpending)}</p>
            <p className="text-xs text-neutral-500 mt-2">Sum of all item prices</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
            <p className="text-neutral-600 text-sm font-medium mb-2">Food Waste Value</p>
            <p className="text-4xl font-bold text-red-600">{formatPKR(analytics.wasteValue)}</p>
            <p className="text-xs text-neutral-500 mt-2">Value of expired items</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
            <p className="text-neutral-600 text-sm font-medium mb-2">Total Transactions</p>
            <p className="text-4xl font-bold text-brand-600">{analytics.totalTransactions}</p>
            <p className="text-xs text-neutral-500 mt-2">Actions recorded</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Used Ingredients */}
          <BarChart
            title="Most Used Ingredients"
            data={analytics.mostUsedIngredients.map((item) => ({ name: item.name, value: item.count }))}
            color="bg-brand-500"
            maxValue={Math.max(...analytics.mostUsedIngredients.map(i => i.count), 1)}
          />

          {/* Consumption Trend */}
          <LineChart
            title="Consumption Trend (Last 30 Days)"
            data={analytics.consumptionTrend}
            color="bg-green-500"
          />

          {/* Monthly Value */}
          <LineChart
            title="Inventory Value Trend"
            data={analytics.monthlyValue}
            color="bg-blue-500"
          />

          {/* Least Used Ingredients */}
          <BarChart
            title="Least Used Ingredients"
            data={analytics.leastUsedIngredients.map((item) => ({ name: item.name, value: item.count }))}
            color="bg-orange-500"
            maxValue={Math.max(...analytics.leastUsedIngredients.map(i => i.count), 1)}
          />
        </div>

        {/* Monthly Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Monthly Additions</h3>
            <div className="space-y-4">
              {Object.entries(analytics.monthlyAdditions)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([month, value]) => (
                  <div key={month}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">{month}</span>
                      <span className="text-sm font-bold text-neutral-900">{value}</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min((value / Math.max(...Object.values(analytics.monthlyAdditions), 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Monthly Consumptions</h3>
            <div className="space-y-4">
              {Object.entries(analytics.monthlyConsumptions)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 6)
                .map(([month, value]) => (
                  <div key={month}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">{month}</span>
                      <span className="text-sm font-bold text-neutral-900">{value}</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min((value / Math.max(...Object.values(analytics.monthlyConsumptions), 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Expired Items */}
        {analytics.expiredItems.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Expired Items (Waste Analysis)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Item Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">Expiry Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-900">Wasted Value</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.expiredItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-6 py-3 font-medium text-neutral-900">{item.name}</td>
                      <td className="px-6 py-3 text-neutral-600">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-red-600">
                        {formatPKR(item.value)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-red-50 font-bold">
                    <td colSpan={2} className="px-6 py-3 text-neutral-900">Total Waste</td>
                    <td className="px-6 py-3 text-right text-red-600">
                      {formatPKR(analytics.wasteValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
