import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice.js';

const SHOP_CATEGORIES = ['Electronics','Fashion','Home & Garden','Books','Sports','Food & Grocery','Toys','Beauty & Health','Handmade','Other'];

export default function VendorRegister() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    shopName: '', description: '', category: '', phone: '',
    address: { street: '', city: '', state: '', country: '' },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName || !form.category) return toast.error('Shop name and category are required');
    setLoading(true);
    try {
      await api.post('/vendors/register', form);
      const { data: userData } = await api.get('/auth/me');
      dispatch(setUser({ ...userData, accessToken: JSON.parse(localStorage.getItem('bazario_user'))?.accessToken }));
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-lg mx-auto py-20 px-4 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">Application Submitted!</h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Your vendor application is under review. We'll notify you once an admin approves your shop.
        This usually takes 1–2 business days.
      </p>
      <button onClick={() => navigate('/')} className="btn-primary">Back to Homepage</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Open Your Shop</h1>
        <p className="text-gray-500 mt-2">Tell us about your business to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
          <input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            placeholder="e.g. Sunrise Crafts" className="input-field" required maxLength={60} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field" required>
            <option value="">Select your main category</option>
            {SHOP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What do you sell? What makes your shop unique?" rows={4}
            className="input-field resize-none" maxLength={500} />
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 555 000 0000" className="input-field" type="tel" />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Business Address</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                placeholder="Street address" className="input-field text-sm" />
            </div>
            <input value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
              placeholder="City" className="input-field text-sm" />
            <input value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
              placeholder="State / Province" className="input-field text-sm" />
            <div className="col-span-2">
              <select value={form.address.country} onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                className="input-field text-sm">
                <option value="">Select country</option>
                {['United States','Pakistan','United Kingdom','Canada','Australia','India','Germany','France'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Your application will be reviewed by our admin team. You'll be able to list products once approved.
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Submitting...' : 'Submit Vendor Application'}
        </button>
      </form>
    </div>
  );
}
