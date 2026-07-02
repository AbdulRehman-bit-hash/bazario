import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice.js';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { name, slug, images, price, discountPrice, ratings, vendor, stock } = product;

  // ── Local "is this in my wishlist" state, just for THIS card.
  // We don't know the user's full wishlist on every product card
  // (that would mean fetching it for every single card on a page,
  // which is wasteful) — so each card just tracks its own toggle
  // state once the user actually clicks it here. If they added it
  // from the product detail page instead, this heart just won't
  // show as filled until they click it here too — that's expected,
  // since this is a lightweight per-card indicator, not a live sync. ──
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock <= 0) return;
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart!');
  };

  // ── THE ACTUAL FIX ──
  // This now calls the REAL backend endpoint (the same one
  // ProductDetailPage.jsx already used), instead of just showing
  // a toast and doing nothing.
  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to save items to your wishlist');
      navigate('/login');
      return;
    }

    if (wishlistLoading) return; // prevent double-clicks while a request is in flight

    setWishlistLoading(true);
    try {
      await api.put(`/users/wishlist/${product._id}`);
      setIsWishlisted((prev) => !prev);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const discount = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const displayPrice = discountPrice || price;

  return (
    <Link to={`/products/${slug}`} className="group card hover:shadow-md transition-shadow duration-200 block">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={images?.[0]?.url || 'https://via.placeholder.com/300'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {stock > 0 && stock <= 5 && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Only {stock} left
          </span>
        )}
        {stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="font-semibold text-gray-600">Out of Stock</span>
          </div>
        )}

        {/* Hover action buttons */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
          <button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className="bg-white shadow-md p-2 rounded-full hover:bg-primary-600 hover:text-white transition disabled:opacity-50"
            title="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`shadow-md p-2 rounded-full transition ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white hover:bg-red-500 hover:text-white'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {vendor?.shopName && (
          <p className="text-xs text-primary-600 font-medium mb-0.5 truncate">{vendor.shopName}</p>
        )}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1.5">{name}</h3>

        {ratings?.count > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(ratings.average) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500">({ratings.count.toLocaleString()})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
          {discountPrice && (
            <span className="text-sm text-gray-400 line-through">${price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
