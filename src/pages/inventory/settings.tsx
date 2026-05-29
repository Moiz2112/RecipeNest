import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Loading from '../../components/Loading';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  if (status === 'loading' || !session) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-neutral-900">Inventory Settings</h1>
          <p className="text-neutral-600 mt-1">Configure your inventory preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Storage Locations */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Storage Locations</h2>
          <p className="text-neutral-600 mb-4">Available storage locations for organizing your inventory:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '🥫', name: 'Pantry', description: 'Dry goods and shelf-stable items' },
              { icon: '❄️', name: 'Refrigerator', description: 'Fresh and chilled items' },
              { icon: '🧊', name: 'Freezer', description: 'Frozen items' },
              { icon: '🍴', name: 'Kitchen Shelf', description: 'Everyday cooking ingredients' }
            ].map((loc, idx) => (
              <div key={idx} className="p-4 bg-brand-50 rounded-lg border border-brand-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{loc.icon}</span>
                  <div>
                    <h3 className="font-bold text-neutral-900">{loc.name}</h3>
                    <p className="text-sm text-neutral-600">{loc.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Measurement Units */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Measurement Units</h2>
          <p className="text-neutral-600 mb-4">Supported units for inventory items:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['kg', 'g', 'L', 'ml', 'pieces', 'dozen', 'pack', 'box', 'bottle', 'can', 'jar', 'cup', 'tbsp', 'tsp', 'oz', 'lb'].map((unit, idx) => (
              <div key={idx} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-center">
                <p className="font-semibold text-neutral-900">{unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Alert Thresholds</h2>
          <p className="text-neutral-600 mb-4">Alerts are automatically generated based on these thresholds:</p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl">🔔</div>
              <div>
                <h3 className="font-bold text-neutral-900">Low Stock Alert</h3>
                <p className="text-sm text-neutral-600">Generated when quantity falls below the minimum threshold you set for each item</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl">⏰</div>
              <div>
                <h3 className="font-bold text-neutral-900">Expiry Alerts</h3>
                <p className="text-sm text-neutral-600">
                  Generated at 7 days, 3 days, 1 day, and on the expiry date
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Key Features</h2>
          <div className="space-y-4">
            {[
              { icon: '📦', title: 'Inventory Tracking', description: 'Track all your grocery items with real-time updates' },
              { icon: '📊', title: 'Analytics', description: 'View detailed insights about your consumption and spending' },
              { icon: '🛒', title: 'Shopping List', description: 'Auto-generate or manually create shopping lists' },
              { icon: '🍳', title: 'Recipe Integration', description: 'Auto-deduct ingredients when you cook recipes' },
              { icon: '📍', title: 'Multiple Locations', description: 'Organize items by pantry, fridge, freezer, etc.' },
              { icon: '🔔', title: 'Smart Alerts', description: 'Receive notifications for low stock and expiry dates' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-bold text-neutral-900">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
