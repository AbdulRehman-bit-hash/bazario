import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../../utils/api.js';
import ProductCard from '../../components/common/ProductCard.jsx';
import Loader from '../../components/common/Loader.jsx';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/users/profile')
      .then(({ data }) => {
        if (!data.wishlist?.length) {
          setProducts([]);
          return;
        }

        // ── THE FIX ──
        // Was calling GET /products/:id, which looks products up by
        // their SLUG (e.g. "sony-wh-1000xm5"), not their MongoDB _id.
        // The wishlist stores raw _id values, so every single lookup
        // was silently failing and getting filtered out below —
        // which is why the wishlist always looked empty even though
        // the IDs were saved correctly. Now using the dedicated
        // /products/id/:id route, which looks up by _id directly.
        Promise.all(
          data.wishlist.map((id) =>
            api.get(`/products/id/${id}`)
              .then((r) => r.data)
              .catch((err) => {
                // Keep this visible during development instead of
                // silently swallowing it — helps catch the NEXT
                // version of this kind of bug much faster.
                console.warn(`Wishlist item ${id} could not be loaded:`, err.response?.status);
                return null;
              })
          )
        ).then((results) => {
          const valid = results.filter(Boolean);
          setProducts(valid);
          if (valid.length < data.wishlist.length) {
            setError(
              `${data.wishlist.length - valid.length} wishlist item(s) could not be loaded (they may have been removed by the vendor).`
            );
          }
        });
      })
      .catch(() => setError('Failed to load your wishlist. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader variant="section" text="Loading your wishlist…" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-6 flex items-center gap-3">
        <Heart className="w-7 h-7 text-red-500 fill-red-500" /> Wishlist
      </h1>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl p-3 mb-5">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-6">Save items you love by tapping the heart icon on any product.</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
