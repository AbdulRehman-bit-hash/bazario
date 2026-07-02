import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../store/slices/productsSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import {
  ShoppingCart, Heart, Star, Store, Shield,
  Truck, RotateCcw, Minus, Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api.js';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(slug));
  }, [slug]);

  useEffect(() => {
    if (product) {
      api.get(`/reviews?product=${product._id}`).then(({ data }) => setReviews(data)).catch(() => {});
    }
  }, [product?._id]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ product, quantity: qty }));
    toast.success(`${qty} item${qty > 1 ? 's' : ''} added to cart!`);
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Please login first');
    try {
      await api.put(`/users/wishlist/${product._id}`);
      toast.success('Wishlist updated!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to write a review');
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', { ...reviewForm, product: product._id });
      setReviews((r) => [data, ...r]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !product) return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-2xl" />
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/4" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    </div>
  );

  const images = product.images?.length ? product.images : [{ url: 'https://via.placeholder.com/600' }];
  const displayPrice = product.discountPrice || product.price;
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-14">
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
            <img src={images[activeImg]?.url} alt={product.name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 shadow rounded-full p-1.5 hover:bg-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 shadow rounded-full p-1.5 hover:bg-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            {discountPct > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{discountPct}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition ${activeImg === i ? 'border-primary-600' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.vendor && (
            <Link to={`/shop/${product.vendor.slug}`}
              className="inline-flex items-center gap-1.5 text-primary-600 text-sm font-medium mb-2 hover:underline">
              <Store className="w-3.5 h-3.5" />
              {product.vendor.shopName}
              {product.vendor.isVerified && (
                <span className="bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full ml-1">Verified</span>
              )}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 leading-tight mb-3">
            {product.name}
          </h1>

          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.ratings.average) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">{product.ratings.average.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.ratings.count} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
            {product.discountPrice && (
              <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {product.specifications?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Specifications</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-500">{spec.key}: </span>
                    <span className="text-gray-800 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium text-sm">
                In Stock {product.stock < 10 && `(only ${product.stock} left)`}
              </span>
            ) : (
              <span className="text-red-500 font-medium text-sm">Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 transition">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-50 transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button onClick={handleWishlist} className="btn-secondary px-4 py-2.5 flex items-center gap-2">
              <Heart className="w-4 h-4" />
            </button>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
            {[{ icon: Truck, label: 'Free Shipping', sub: 'Orders over $100' },
              { icon: Shield, label: 'Secure Pay', sub: 'SSL encrypted' },
              { icon: RotateCcw, label: 'Easy Returns', sub: '30 day policy' }].map(({ icon: Icon, label, sub }) => (
              <div key={label}>
                <Icon className="w-5 h-5 mx-auto text-primary-600 mb-1" />
                <p className="text-xs font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="card p-6 h-fit">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          {product.ratings?.count > 0 ? (
            <div className="text-center mb-4">
              <span className="text-5xl font-bold text-gray-900">{product.ratings.average.toFixed(1)}</span>
              <div className="flex justify-center my-2">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.ratings.average) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-500">{product.ratings.count} reviews</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-4">No reviews yet. Be the first!</p>
          )}

          {user && (
            <form onSubmit={handleReviewSubmit} className="border-t border-gray-100 pt-4 mt-4 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Write a Review</h3>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                      <Star className={`w-6 h-6 transition ${s <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Review title" value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="input-field text-sm" />
              <textarea required placeholder="Share your experience..." value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={3} className="input-field text-sm resize-none" />
              <button type="submit" disabled={submittingReview} className="btn-primary w-full text-sm py-2">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p>No reviews yet for this product.</p>
            </div>
          ) : reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.buyer?.name || 'Anonymous'}</p>
                  {r.isVerifiedPurchase && <span className="text-xs text-green-600 font-medium">Verified Purchase</span>}
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              {r.title && <p className="font-medium text-gray-800 text-sm mb-1">{r.title}</p>}
              <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
