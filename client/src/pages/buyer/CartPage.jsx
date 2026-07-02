import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromCart, updateQuantity, selectCartTotal } from '../../store/slices/cartSlice.js';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto py-20 text-center px-4">
      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Explore our marketplace and add some items!</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="card p-4 flex gap-4">
              <img src={product.images?.[0]?.url || 'https://via.placeholder.com/80'} alt={product.name}
                className="w-20 h-20 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product.slug}`} className="font-medium text-gray-800 line-clamp-1 hover:text-primary-600">{product.name}</Link>
                <p className="text-sm text-gray-500">{product.vendor?.shopName}</p>
                <p className="font-bold text-gray-900 mt-1">${(product.discountPrice || product.price).toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => quantity > 1 ? dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 })) : dispatch(removeFromCart(product._id))}
                      className="p-1.5 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                    <span className="px-3 text-sm font-medium">{quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: Math.min(quantity + 1, product.stock) }))}
                      className="p-1.5 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(product._id))} className="text-red-400 hover:text-red-600 p-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{total > 100 ? 'Free' : '$9.99'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tax (5%)</span><span>${(total * 0.05).toFixed(2)}</span></div>
            <hr className="border-gray-100" />
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>${(total + (total > 100 ? 0 : 9.99) + total * 0.05).toFixed(2)}</span></div>
          </div>
          <Link to="/checkout" className="btn-primary w-full block text-center">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
