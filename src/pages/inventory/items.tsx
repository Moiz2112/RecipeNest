import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from '../../components/Loading';
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  expiryDate: string;
  status: string;
}

export default function InventoryItems() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory');
      setItems(response.data.data);

      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.data.map((item: InventoryItem) => item.category))];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = items;

    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(item => item.location === locationFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  }, [items, search, categoryFilter, locationFilter, statusFilter]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchItems();
  }, [status, fetchItems]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/inventory/${id}`);
        setItems(items.filter(item => item._id !== id));
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const handleEdit = (item: InventoryItem) => {
    router.push(`/inventory/add-item?edit=${item._id}`);
  };

  const handleReduce = async (item: InventoryItem) => {
    const input = prompt(`Reduce quantity for ${item.name} (current: ${item.quantity} ${item.unit}). Enter amount to reduce:`);
    if (!input) return;
    const reduceBy = Number(input);
    if (isNaN(reduceBy) || reduceBy <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    const newQuantity = Math.max(0, item.quantity - reduceBy);

    try {
      const response = await axios.put(`/api/inventory/${item._id}`, { quantity: newQuantity });
      // Update local state
      setItems(prev => prev.map(i => (i._id === item._id ? response.data.data : i)));
      setFilteredItems(prev => prev.map(i => (i._id === item._id ? response.data.data : i)));
    } catch (error) {
      console.error('Failed to reduce quantity:', error);
      alert('Failed to update item quantity');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-700';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-700';
      case 'out-of-stock':
        return 'bg-red-100 text-red-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getExpiryColor = (expiryDate: string) => {
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (daysLeft < 0) return 'text-red-600';
    if (daysLeft <= 1) return 'text-red-600';
    if (daysLeft <= 3) return 'text-orange-600';
    if (daysLeft <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Inventory Items</h1>
            <p className="text-neutral-600 mt-1">Manage all your grocery items</p>
          </div>
          <button
            onClick={() => router.push('/inventory/add-item')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Locations</option>
            <option value="Pantry">Pantry</option>
            <option value="Refrigerator">Refrigerator</option>
            <option value="Freezer">Freezer</option>
            <option value="Kitchen Shelf">Kitchen Shelf</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="expired">Expired</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('');
              setLocationFilter('');
              setStatusFilter('');
            }}
            className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Items Count */}
        <p className="text-neutral-600 mb-4">
          Showing {filteredItems.length} of {items.length} items
        </p>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-lg border border-neutral-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-brand-50 to-brand-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Expiry Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                      No items found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-neutral-900">{item.name}</td>
                      <td className="px-6 py-4 text-neutral-600">{item.category}</td>
                      <td className="px-6 py-4 text-neutral-900">
                        {item.quantity} <span className="text-neutral-500 text-sm">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600">{item.location}</td>
                      <td className={`px-6 py-4 font-medium ${getExpiryColor(item.expiryDate)}`}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status === 'in-stock' ? 'In Stock' : item.status === 'low-stock' ? 'Low Stock' : item.status === 'out-of-stock' ? 'Out of Stock' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span className="text-xs font-medium">Edit</span>
                        </button>
                        <button
                          onClick={() => handleReduce(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <span className="text-xs font-medium">Reduce</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span className="text-xs font-medium">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
