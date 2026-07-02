import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, Star, Clock } from 'lucide-react';
import api from '../../utils/api.js';

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/vendors/dashboard');
        setData(res.data || { stats: {}, recentOrders: [] });
      } catch (err) {
        console.error('Dashboard API error:', err);
        setData({ stats: {}, recentOrders: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // SAFE LOADING STATE
  if (loading || !data) {
    return (
      <div className="p-8 space-y-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // SAFE FALLBACKS (VERY IMPORTANT)
  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  const statCards = [
    {
      icon: Package,
      label: 'Total Products',
      value: stats.totalProducts || 0,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: stats.totalOrders || 0,
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Star,
      label: 'Avg Rating',
      value: stats.averageRating?.toFixed(1) || 'N/A',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back! Here's your store overview.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/vendor/products" className="card p-5 hover:shadow-md transition flex items-center gap-4">
          <div className="bg-primary-50 rounded-xl p-3">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Manage Products</h3>
            <p className="text-sm text-gray-500">Add, edit, or remove your products</p>
          </div>
        </Link>

        <Link to="/vendor/orders" className="card p-5 hover:shadow-md transition flex items-center gap-4">
          <div className="bg-green-50 rounded-xl p-3">
            <ShoppingBag className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">View Orders</h3>
            <p className="text-sm text-gray-500">Process and track your orders</p>
          </div>
        </Link>
      </div>

      {/* RECENT ORDERS */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-6 text-gray-400 text-center">No orders yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    #{order._id?.slice(-6)?.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.buyer?.name || 'Unknown'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${(order.pricing?.total || 0).toFixed(2)}
                  </p>

                  <span
                    className={`badge text-xs ${
                      order.orderStatus === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.orderStatus === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {order.orderStatus || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}