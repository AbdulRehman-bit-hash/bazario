import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Package, ShieldCheck } from 'lucide-react';
import api from '../../utils/api.js';
import ProductCard from '../../components/common/ProductCard.jsx';

export default function VendorShopPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vendors/${slug}`).then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-6 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  );

  if (!data) return (
    <div className="text-center py-20">
      <p className="text-gray-400 text-lg">Vendor not found</p>
      <Link to="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
    </div>
  );

  const { vendor, products } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Shop banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-600 to-orange-500 h-48 mb-6">
        {vendor.banner?.url && (
          <img src={vendor.banner.url} alt="Shop banner" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-5 left-6 flex items-end gap-4">
          {vendor.logo?.url ? (
            <img src={vendor.logo.url} alt={vendor.shopName}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-3xl font-bold text-primary-600 border-4 border-white shadow-lg">
              {vendor.shopName[0]}
            </div>
          )}
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-white">{vendor.shopName}</h1>
              {vendor.isVerified && <ShieldCheck className="w-5 h-5 text-blue-300" />}
            </div>
            {vendor.ratings?.count > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white text-sm font-medium">{vendor.ratings.average.toFixed(1)}</span>
                <span className="text-white/70 text-sm">({vendor.ratings.count} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shop info bar */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {vendor.description && (
          <div className="sm:col-span-2 card p-4">
            <p className="text-gray-600 text-sm leading-relaxed">{vendor.description}</p>
          </div>
        )}
        <div className="card p-4 space-y-2">
          {vendor.address?.city && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
              <span>{vendor.address.city}, {vendor.address.country}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4 text-primary-500 shrink-0" />
            <span>{products.length} products listed</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4 text-primary-500 shrink-0" />
            <span>Member since {new Date(vendor.createdAt).getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-5">Products from {vendor.shopName}</h2>
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p>No products listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
