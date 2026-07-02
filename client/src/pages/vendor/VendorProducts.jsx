import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', price: '', discountPrice: '',
  stock: '', category: '', subcategory: '',
  images: [{ url: '', alt: '' }],
  shippingInfo: { freeShipping: false, shippingCost: 0 },
  isFeatured: false,
  specifications: [],
  tags: '',
};

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/products/my${params}`).then(({ data }) => setProducts(data.products)).finally(() => setLoading(false));
  };

 useEffect(() => {
  api.get('/categories').then(({ data }) => {
    //console.log('categories API response:', data);
    setCategories(data.categories || data.data || data);
  });
  fetchProducts();
}, []);

  useEffect(() => { fetchProducts(); }, [search]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({
      ...p,
      price: p.price?.toString(),
      discountPrice: p.discountPrice?.toString() || '',
      stock: p.stock?.toString(),
      category: p.category?._id || p.category,
      tags: p.tags?.join(', ') || '',
    });
    setEditingId(p._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSave = async (e) => {
  e.preventDefault();

  console.log("🔥 HANDLE SAVE TRIGGERED");
  setSaving(true);

  try {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock),
      category: form.category || null,
      images: form.images?.[0]?.url ? form.images : [],
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      isFeatured: form.isFeatured,
    };

    console.log("📦 PAYLOAD:", payload);

    const res = await api.post('/products', payload);

    console.log("✅ SUCCESS:", res.data);

    toast.success("Product created!");

    // 🔥 IMPORTANT FIXES
    setShowModal(false);
    fetchProducts(); // refresh list

  } catch (err) {
  console.log("❌ ERROR:", err.response?.data || err.message);
  toast.error(err.response?.data?.message || "Failed to create product");
} finally {
    console.log("🏁 FINALLY");
    setSaving(false);
  }
};

  const toggleActive = async (p) => {
    try {
      const { data } = await api.put(`/products/${p._id}`, { isActive: !p.isActive });
      setProducts((prev) => prev.map((x) => (x._id === p._id ? { ...x, isActive: data.isActive } : x)));
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products in your store</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..." className="input-field pl-9 text-sm" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">No products yet. Add your first product!</p>
          <button onClick={openCreate} className="btn-primary">Add Product</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sold</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'}
                        alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">${(p.discountPrice || p.price).toFixed(2)}</p>
                    {p.discountPrice && <p className="text-xs text-gray-400 line-through">${p.price.toFixed(2)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-500' : 'text-gray-800'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.sold || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)} className="flex items-center gap-1 text-xs font-medium">
                      {p.isActive
                        ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">Active</span></>
                        : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Hidden</span></>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-gray-900">
                {editingId ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" required placeholder="e.g. Handmade Ceramic Mug" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none" rows={4} required placeholder="Describe your product..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Price ($) *</label>
                  <input type="number" step="0.01" min="0" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field" required placeholder="29.99" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Sale Price ($)</label>
                  <input type="number" step="0.01" min="0" value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    className="input-field" placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stock *</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="input-field" required placeholder="100" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Category </label>
                 <div>
  <select
    value={form.category}
    onChange={(e) =>
      setForm({ ...form, category: e.target.value })
    }
    className="input-field"
    
  >
    <option value="">Select category</option>

    {categories?.map((c) => (
      <option key={c._id} value={c._id}>
        {c.name}
      </option>
    ))}
  </select>
</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Image URL</label>
                <input value={form.images?.[0]?.url || ''} placeholder="https://..."
                  onChange={(e) => setForm({ ...form, images: [{ url: e.target.value, alt: form.name }] })}
                  className="input-field text-sm" />
                <p className="text-xs text-gray-400 mt-1">Paste a direct image URL (Cloudinary upload coming soon)</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tags</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="handmade, ceramic, mug  (comma separated)" className="input-field text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-primary-600" />
                <label htmlFor="featured" className="text-sm text-gray-700">Mark as featured product</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
