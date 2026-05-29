import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from '../../components/Loading';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '📦', color: '#f59e0b' });

  // Keep hooks stable; guard fetching by auth status
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchCategories();
  }, [status]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        await axios.put('/api/inventory/categories', { id: editingId, ...formData });
      } else {
        await axios.post('/api/inventory/categories', formData);
      }
      setFormData({ name: '', icon: '📦', color: '#f59e0b' });
      setShowForm(false);
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEdit = (cat: Category) => {
    setFormData({ name: cat.name, icon: cat.icon, color: cat.color });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await axios.delete(`/api/inventory/categories?id=${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', icon: '📦', color: '#f59e0b' });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Categories</h1>
            <p className="text-neutral-600 mt-1">Organize your inventory items</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', icon: '📦', color: '#f59e0b' });
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Category name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-2xl"
              />
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 shadow-lg border border-neutral-100/50 text-center">
            <p className="text-neutral-500 text-lg">No categories yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div
                key={cat._id}
                className="rounded-2xl bg-white p-6 shadow-lg border border-neutral-100/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{cat.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">{cat.name}</h3>
                      <div
                        className="w-8 h-3 rounded-full mt-1"
                        style={{ backgroundColor: cat.color }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
