import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from '../../components/Loading';

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category: string;
  location: string;
}

export default function ExpiryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState('all');

  // Keep hooks stable; guard fetching by auth status
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchItems();
  }, [status]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory');
      
      // Sort by expiry date
      const sorted = response.data.data.sort((a: InventoryItem, b: InventoryItem) => 
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );
      
      setItems(sorted);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) return { status: 'expired', label: 'Expired', color: 'text-white bg-red-600' };
    if (daysLeft <= 1) return { status: 'critical', label: 'Today', color: 'text-white bg-red-500' };
    if (daysLeft <= 3) return { status: 'urgent', label: `${daysLeft} days`, color: 'text-white bg-orange-500' };
    if (daysLeft <= 7) return { status: 'soon', label: `${daysLeft} days`, color: 'text-white bg-yellow-500' };
    return { status: 'safe', label: `${daysLeft} days`, color: 'text-white bg-green-500' };
  };

  const getExpiryBorderColor = (expiryDate: string) => {
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) return 'border-l-4 border-l-red-600';
    if (daysLeft <= 1) return 'border-l-4 border-l-red-500';
    if (daysLeft <= 3) return 'border-l-4 border-l-orange-500';
    if (daysLeft <= 7) return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-green-500';
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    const status = getExpiryStatus(item.expiryDate).status;
    return status === filter;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-neutral-900">Expiry Tracking</h1>
          <p className="text-neutral-600 mt-1">Monitor items by expiry date</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          {[
            { value: 'all', label: 'All Items', count: items.length },
            { value: 'expired', label: 'Expired', count: items.filter(i => Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) < 0).length },
            { value: 'critical', label: 'Critical (Today)', count: items.filter(i => {
              const d = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return d <= 1 && d >= 0;
            }).length },
            { value: 'urgent', label: 'Urgent (2-3 days)', count: items.filter(i => {
              const d = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return d <= 3 && d > 1;
            }).length },
            { value: 'soon', label: 'Soon (4-7 days)', count: items.filter(i => {
              const d = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return d <= 7 && d > 3;
            }).length },
            { value: 'safe', label: 'Safe (8+ days)', count: items.filter(i => {
              const d = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return d > 7;
            }).length }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                filter === f.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 shadow-lg border border-neutral-100/50 text-center">
              <p className="text-neutral-500 text-lg">No items in this category</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const expiryStatus = getExpiryStatus(item.expiryDate);
              const borderColor = getExpiryBorderColor(item.expiryDate);
              
              return (
                <div
                  key={item._id}
                  className={`rounded-xl bg-white p-6 shadow-md border border-neutral-100/50 hover:shadow-lg transition-all duration-300 ${borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900">{item.name}</h3>
                      <div className="flex items-center gap-6 mt-2 text-sm text-neutral-600">
                        <span>Category: <span className="font-semibold text-neutral-900">{item.category}</span></span>
                        <span>Location: <span className="font-semibold text-neutral-900">{item.location}</span></span>
                        <span>Stock: <span className="font-semibold text-neutral-900">{item.quantity} {item.unit}</span></span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-neutral-900">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${expiryStatus.color}`}>
                        {expiryStatus.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
