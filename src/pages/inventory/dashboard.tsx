import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from '../../components/Loading';
import { StatCard } from '../../components/Inventory_Dashboard/StatCard';
import { BarChart, LineChart, PieChart } from '../../components/Inventory_Dashboard/Charts';
import { AlertWidget } from '../../components/Inventory_Dashboard/AlertWidget';
import { RecentActivityWidget } from '../../components/Inventory_Dashboard/RecentActivityWidget';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface DashboardData {
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    expiringSoon: number;
    expiredCount: number;
    totalCategories: number;
  };
  categoryBreakdown: Array<{ name: string; count: number; value: number }>;
  dailyConsumption: { [key: string]: number };
  expiryTimeline: Array<{ name: string; expiryDate: string; daysLeft: number }>;
  alerts: Array<any>;
  recentActivity: Array<any>;
  lowStockItems: Array<any>;
}

export default function InventoryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Keep hooks stable; guard fetching by auth status
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchDashboardData();
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory/dashboard');
      setDashboardData(response.data);

      // Generate alerts
      await axios.post('/api/inventory/generate-alerts');
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading || !dashboardData) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Inventory Dashboard</h1>
            <p className="text-neutral-600 mt-1">Monitor and manage your smart kitchen</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-medium text-neutral-700 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push('/inventory/add-item')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon="📦"
            label="Total Items"
            value={dashboardData.stats.totalItems}
            color="orange"
            onClick={() => router.push('/inventory/items')}
          />
          <StatCard
            icon="🏷️"
            label="Categories"
            value={dashboardData.stats.totalCategories}
            color="blue"
          />
          <StatCard
            icon="⚠️"
            label="Low Stock"
            value={dashboardData.stats.lowStockCount}
            color="red"
          />
          <StatCard
            icon="⏰"
            label="Expiring Soon"
            value={dashboardData.stats.expiringSoon}
            color="purple"
          />
          <StatCard
            icon="💰"
            label="Total Value"
            value={new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(dashboardData.stats.totalValue)}
            color="green"
          />
          <StatCard
            icon="❌"
            label="Expired"
            value={dashboardData.stats.expiredCount}
            color="red"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <PieChart
            title="Inventory by Category"
            data={dashboardData.categoryBreakdown.map((cat, idx) => ({
              name: cat.name,
              value: cat.count,
              color: ['bg-brand-500', 'bg-accent-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][idx % 5]
            }))}
          />

          {/* Consumption Trend */}
          <LineChart
            title="Daily Consumption (Last 30 Days)"
            data={dashboardData.dailyConsumption}
            color="bg-brand-500"
          />
        </div>

        {/* Widgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Alerts Widget */}
          <AlertWidget
            alerts={dashboardData.alerts}
            onMarkRead={handleRefresh}
          />

          {/* Recent Activity */}
          <RecentActivityWidget activities={dashboardData.recentActivity} />
        </div>

        {/* Expiry Timeline */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50 mb-8">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Expiry Timeline</h3>
          <div className="space-y-3">
            {dashboardData.expiryTimeline.slice(0, 10).map((item, idx) => {
              const daysLeft = item.daysLeft;
              let color = 'text-green-600';
              let bgColor = 'bg-green-100';

              if (daysLeft <= 1) {
                color = 'text-red-600';
                bgColor = 'bg-red-100';
              } else if (daysLeft <= 3) {
                color = 'text-orange-600';
                bgColor = 'bg-orange-100';
              } else if (daysLeft <= 7) {
                color = 'text-yellow-600';
                bgColor = 'bg-yellow-100';
              }

              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-neutral-900">{item.name}</p>
                    <p className="text-sm text-neutral-500">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`${bgColor} ${color} px-3 py-1 rounded-lg font-semibold text-sm`}>
                    {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Items */}
        {dashboardData.lowStockItems.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Items Running Low</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.lowStockItems.map((item) => (
                <div key={item._id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="font-semibold text-neutral-900">{item.name}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-neutral-600">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                      Low Stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
