import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const statusColors = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

function OrderRow({ order, vendorId, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState('');

  const vendorStatus = order.vendorStatuses?.find((vs) => vs.vendor === vendorId || vs.vendor?._id === vendorId)?.status || 'pending';
  const nextStatus = NEXT_STATUS[vendorStatus];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await api.put(`/orders/${order._id}/vendor-status`, { status: nextStatus, trackingNumber: tracking });
      toast.success(`Status updated to ${nextStatus}`);
      onStatusUpdate(order._id, nextStatus);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Only show items from this vendor
  const myItems = order.items?.filter((i) => {
    const vid = i.vendor?._id || i.vendor;
    return vid === vendorId || vid?.toString() === vendorId?.toString();
  });

  const myRevenue = myItems?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}>
        <div>
          <p className="font-semibold text-gray-900 text-sm">#{order._id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · {order.buyer?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${statusColors[vendorStatus]}`}>{vendorStatus}</span>
          <span className="font-bold text-gray-900 text-sm">${myRevenue.toFixed(2)}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
          {/* My items in this order */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Items</p>
            {myItems?.map((item) => (
              <div key={item._id || item.product} className="flex items-center gap-3 bg-white rounded-xl p-3">
                <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                </div>
                <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Ship to */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ship To</p>
            <p className="text-sm text-gray-600 bg-white rounded-xl p-3">
              {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
              {order.shippingAddress?.state} {order.shippingAddress?.zip},{' '}
              {order.shippingAddress?.country}
            </p>
          </div>

          {/* Advance status */}
          {nextStatus && (
            <div className="flex items-center gap-3">
              {nextStatus === 'shipped' && (
                <input value={tracking} onChange={(e) => setTracking(e.target.value)}
                  placeholder="Tracking number (optional)" className="input-field text-sm flex-1" />
              )}
              <button onClick={handleAdvance} disabled={updating}
                className="btn-primary text-sm py-2 whitespace-nowrap">
                {updating ? 'Updating...' : `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
              </button>
            </div>
          )}
          {!nextStatus && vendorStatus !== 'cancelled' && (
            <p className="text-sm text-green-600 font-medium">Order Complete</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/vendors/me'),
      api.get('/orders/vendor'),
    ]).then(([{ data: vendor }, { data: orderData }]) => {
      setVendorId(vendor._id);
      setOrders(orderData.orders);
    }).finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => {
      if (o._id !== orderId) return o;
      return {
        ...o,
        vendorStatuses: o.vendorStatuses.map((vs) =>
          vs.vendor === vendorId || vs.vendor?._id === vendorId ? { ...vs, status: newStatus } : vs
        ),
      };
    }));
  };

  const filtered = filter ? orders.filter((o) => {
    const vs = o.vendorStatuses?.find((v) => v.vendor === vendorId || v.vendor?._id === vendorId);
    return vs?.status === filter;
  }) : orders;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} total orders</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto text-sm">
          <option value="">All Statuses</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No orders to show</p>
        </div>
      ) : (
        filtered.map((o) => (
          <OrderRow key={o._id} order={o} vendorId={vendorId} onStatusUpdate={handleStatusUpdate} />
        ))
      )}
    </div>
  );
}
