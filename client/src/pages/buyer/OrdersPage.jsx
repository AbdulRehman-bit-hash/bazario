import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api.js';

const statusColors = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-700',
};

const STEPS_ORDER = ['pending','confirmed','processing','shipped','delivered'];

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = STEPS_ORDER.indexOf(order.orderStatus);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2.5 rounded-xl">
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`badge ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
          <p className="font-bold text-gray-900">${order.pricing?.total?.toFixed(2)}</p>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4">
          {/* Progress tracker */}
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'refunded' && (
            <div className="mb-5">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 z-0">
                  <div className="h-full bg-primary-500 transition-all"
                    style={{ width: `${Math.max(0, (currentStep / (STEPS_ORDER.length - 1)) * 100)}%` }} />
                </div>
                {STEPS_ORDER.map((s, i) => (
                  <div key={s} className="flex flex-col items-center z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
                      i < currentStep ? 'bg-primary-600 border-primary-600 text-white' :
                      i === currentStep ? 'bg-white border-primary-600 text-primary-600' :
                      'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 capitalize hidden sm:block">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-3 mb-4">
            {order.items?.map((item) => (
              <div key={item._id || item.product?._id} className="flex gap-3 items-center">
                <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} · ${item.price?.toFixed(2)} each</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>${order.pricing?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span><span>{order.pricing?.shippingCost === 0 ? 'Free' : `$${order.pricing?.shippingCost?.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span><span>${order.pricing?.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5 mt-1">
              <span>Total</span><span>${order.pricing?.total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <p className="text-xs text-gray-500 mt-3">
              Shipping to: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/orders/my${params}`)
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">My Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="input-field w-auto text-sm">
          <option value="">All Orders</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">When you place orders, they'll appear here.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => <OrderCard key={o._id} order={o} />)}
        </div>
      )}
    </div>
  );
}
