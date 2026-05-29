import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from '../../components/Loading';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Alert {
  _id: string;
  itemName: string;
  alertType: string;
  severity: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter === 'all' ? {} : { read: filter === 'unread' ? 'false' : 'true' };
      const response = await axios.get('/api/inventory/alerts', { params });
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchAlerts();
  }, [status, fetchAlerts]);

  const handleMarkRead = async (id: string) => {
    try {
      await axios.put('/api/inventory/alerts', { id });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete('/api/inventory/alerts', { data: { id } });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { text: 'Critical', color: 'text-red-700 bg-red-100' };
      case 'warning':
        return { text: 'Warning', color: 'text-yellow-700 bg-yellow-100' };
      default:
        return { text: 'Info', color: 'text-blue-700 bg-blue-100' };
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-neutral-900">Alerts</h1>
          <p className="text-neutral-600 mt-1">Manage your inventory notifications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-6">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === f
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({alerts.filter(a => f === 'all' || (f === 'unread' ? !a.read : a.read)).length})
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 shadow-lg border border-neutral-100/50 text-center">
              <p className="text-neutral-500 text-lg">No alerts found</p>
            </div>
          ) : (
            alerts.map(alert => {
              const severity = getSeverityLabel(alert.severity);
              const borderColor = getSeverityColor(alert.severity);
              
              return (
                <div
                  key={alert._id}
                  className={`rounded-2xl border-2 ${borderColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                  onClick={() => !alert.read && handleMarkRead(alert._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900">{alert.itemName}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${severity.color}`}>
                          {severity.text}
                        </span>
                        {!alert.read && (
                          <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-neutral-700 mb-2">{alert.message}</p>
                      <p className="text-sm text-neutral-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!alert.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(alert._id);
                          }}
                          className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-200 transition-colors"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(alert._id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
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
