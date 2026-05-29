import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from '../../components/Loading';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function AddItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { edit } = router.query;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(!!edit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    unit: 'pieces',
    price: 0,
    minimumThreshold: 1,
    expiryDate: '',
    location: 'Pantry',
    notes: '',
    image: '',
    barcode: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  // Keep hooks in stable order; guard side-effects by auth status
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (edit) {
      (async () => {
        try {
          const response = await axios.get(`/api/inventory/${edit}`);
          const item = response.data.data;
          setFormData({
            ...item,
            expiryDate: new Date(item.expiryDate).toISOString().split('T')[0],
            purchaseDate: new Date(item.purchaseDate).toISOString().split('T')[0]
          });
        } catch (error) {
          console.error('Failed to fetch item:', error);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [status, edit]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/api/inventory/${edit}`);
      const item = response.data.data;
      setFormData({
        ...item,
        expiryDate: new Date(item.expiryDate).toISOString().split('T')[0],
        purchaseDate: new Date(item.purchaseDate).toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Failed to fetch item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.expiryDate || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      if (edit) {
        await axios.put(`/api/inventory/${edit}`, formData);
      } else {
        await axios.post('/api/inventory', formData);
      }

      router.push('/inventory/items');
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-neutral-900">
            {edit ? 'Edit Item' : 'Add New Item'}
          </h1>
          <p className="text-neutral-600 mt-1">
            {edit ? 'Update your grocery item details' : 'Add a new grocery item to your inventory'}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step <= currentStep
                      ? 'bg-brand-500 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                      step < currentStep ? 'bg-brand-500' : 'bg-neutral-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm font-medium text-neutral-600">
            <span className={currentStep === 1 ? 'text-brand-600 font-bold' : ''}>Basic Info</span>
            <span className={currentStep === 2 ? 'text-brand-600 font-bold' : ''}>Stock Details</span>
            <span className={currentStep === 3 ? 'text-brand-600 font-bold' : ''}>Expiry & Storage</span>
            <span className={currentStep === 4 ? 'text-brand-600 font-bold' : ''}>Review</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-white p-8 shadow-lg border border-neutral-100/50">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeInUp">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Basic Information</h2>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Organic Tomatoes"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Vegetables"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="L">Liter (L)</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="pieces">Pieces</option>
                      <option value="dozen">Dozen</option>
                      <option value="pack">Pack</option>
                      <option value="box">Box</option>
                      <option value="bottle">Bottle</option>
                      <option value="can">Can</option>
                      <option value="jar">Jar</option>
                      <option value="cup">Cup</option>
                      <option value="tbsp">Tablespoon (tbsp)</option>
                      <option value="tsp">Teaspoon (tsp)</option>
                      <option value="oz">Ounce (oz)</option>
                      <option value="lb">Pound (lb)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="e.g., 123456789"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Stock Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeInUp">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Stock Details</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Current Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Minimum Threshold *
                    </label>
                    <input
                      type="number"
                      name="minimumThreshold"
                      value={formData.minimumThreshold}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                    <p className="text-xs text-neutral-500 mt-1">Alert when quantity drops below this</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Expiry & Storage */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeInUp">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Expiry & Storage</h2>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Storage Location *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Pantry">Pantry</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Kitchen Shelf">Kitchen Shelf</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g., Keep in cool, dry place"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 h-24 resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeInUp">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Review & Save</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-50 p-4 rounded-xl">
                    <p className="text-xs text-neutral-600">Item Name</p>
                    <p className="text-lg font-bold text-neutral-900">{formData.name}</p>
                  </div>
                  <div className="bg-brand-50 p-4 rounded-xl">
                    <p className="text-xs text-neutral-600">Category</p>
                    <p className="text-lg font-bold text-neutral-900">{formData.category}</p>
                  </div>
                  <div className="bg-brand-50 p-4 rounded-xl">
                    <p className="text-xs text-neutral-600">Quantity</p>
                    <p className="text-lg font-bold text-neutral-900">{formData.quantity} {formData.unit}</p>
                  </div>
                  <div className="bg-brand-50 p-4 rounded-xl">
                    <p className="text-xs text-neutral-600">Price</p>
                    <p className="text-lg font-bold text-neutral-900">${formData.price}</p>
                  </div>
                  <div className="bg-brand-50 p-4 rounded-xl">
                    <p className="text-xs text-neutral-600">Expiry Date</p>
                    <p className="text-lg font-bold text-neutral-900">{new Date(formData.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-brand-50 p-4 rounded-xl">
                    <p className="text-xs text-neutral-600">Location</p>
                    <p className="text-lg font-bold text-neutral-900">{formData.location}</p>
                  </div>
                </div>

                {formData.notes && (
                  <div className="bg-neutral-50 p-4 rounded-xl">
                    <p className="text-xs text-neutral-600 mb-2">Notes</p>
                    <p className="text-neutral-700">{formData.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-lg font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                  className="ml-auto flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => router.push('/inventory/items')}
                    className="ml-auto px-6 py-3 border border-neutral-300 rounded-lg font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : edit ? 'Update Item' : 'Add Item'}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
