import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from '../../components/Loading';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ShoppingItem {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  priority: string;
  completed: boolean;
}

export default function ShoppingListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'pieces', priority: 'medium' });
  const [showForm, setShowForm] = useState(false);

  // Keep hooks stable; guard fetching by auth status
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchShoppingList();
  }, [status]);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory/shopping-list');
      setItems(response.data.data);
    } catch (error) {
      console.error('Failed to fetch shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    try {
      await axios.post('/api/inventory/shopping-list', {
        action: 'add',
        itemName: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        priority: newItem.priority
      });
      setNewItem({ name: '', quantity: 1, unit: 'pieces', priority: 'medium' });
      setShowForm(false);
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await axios.put('/api/inventory/shopping-list', {
        id,
        completed: !completed
      });
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/inventory/shopping-list?id=${id}`);
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleAutoGenerate = async () => {
    try {
      await axios.post('/api/inventory/shopping-list', {
        action: 'auto-generate'
      });
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to auto-generate list:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const pendingItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Shopping List</h1>
            <p className="text-neutral-600 mt-1">Manage your grocery shopping</p>
          </div>
          <button
            onClick={handleAutoGenerate}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
          >
            Auto-Generate from Low Stock
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Item Form */}
        {showForm && (
          <form onSubmit={handleAddItem} className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Add Item to Shopping List</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                min="1"
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="pieces">Pieces</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pack">Pack</option>
              </select>
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium mb-8"
          >
            <PlusIcon className="w-4 h-4" />
            Add Item
          </button>
        )}

        {/* Pending Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            To Buy ({pendingItems.length})
          </h2>

          {pendingItems.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 shadow-lg border border-neutral-100/50 text-center">
              <p className="text-neutral-500 text-lg">No items on your shopping list yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingItems.sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return (priorityOrder[b.priority as keyof typeof priorityOrder] || 2) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 2);
              }).map(item => (
                <div
                  key={item._id}
                  className="rounded-xl bg-white p-4 shadow-md border border-neutral-100/50 flex items-center justify-between hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => handleToggleComplete(item._id, item.completed)}
                      className="w-6 h-6 rounded-lg border-2 border-neutral-300 hover:border-brand-500 transition-colors flex items-center justify-center"
                    >
                      {item.completed && <CheckIcon className="w-4 h-4 text-brand-500" />}
                    </button>
                    <div>
                      <p className="font-semibold text-neutral-900">{item.itemName}</p>
                      <p className="text-sm text-neutral-500">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </span>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Completed ({completedItems.length})
            </h2>
            <div className="space-y-3">
              {completedItems.map(item => (
                <div
                  key={item._id}
                  className="rounded-xl bg-gray-50 p-4 shadow-md border border-neutral-100/50 flex items-center justify-between opacity-70"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => handleToggleComplete(item._id, item.completed)}
                      className="w-6 h-6 rounded-lg bg-green-500 text-white flex items-center justify-center"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <div>
                      <p className="font-semibold text-neutral-600 line-through">{item.itemName}</p>
                      <p className="text-sm text-neutral-500">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
