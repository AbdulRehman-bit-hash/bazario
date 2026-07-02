import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Package, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import api from '../../utils/api.js';

const statusColors = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
    </div>
  );

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
    { icon: Store, label: 'Active Vendors', value: stats.totalVendors, color: 'bg-purple-50 text-purple-600', link: '/admin/vendors' },
    { icon: Package, label: 'Products', value: stats.totalProducts, color: 'bg-amber-50 text-amber-600', link: null },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'bg-green-50 text-green-600', link: '/admin/orders' },
    { icon: DollarSign, label: 'Platform Revenue', value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`, color: 'bg-emerald-50 text-emerald-600', link: null },
    { icon: Clock, label: 'Pending Vendors', value: stats.pendingVendors, color: 'bg-orange-50 text-orange-600', link: '/admin/vendors?status=pending' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, link }) => {
          const inner = (
            <div className="card p-5 hover:shadow-md transition">
              <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          );
          return link ? <Link key={label} to={link}>{inner}</Link> : <div key={label}>{inner}</div>;
        })}
      </div>

      {/* Pending vendor alert */}
      {stats.pendingVendors > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-orange-800">{stats.pendingVendors} vendor{stats.pendingVendors > 1 ? 's' : ''} awaiting approval</p>
            <p className="text-sm text-orange-600">Review and approve their shop applications</p>
          </div>
          <Link to="/admin/vendors" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Review Now
          </Link>
        </div>
      )}

      {/* Recent orders */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-primary-600 text-sm hover:underline">View all</Link>
        </div>
        {!stats.recentOrders?.length ? (
          <p className="p-6 text-gray-400 text-center text-sm">No orders yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.map((o) => (
              <div key={o._id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">#{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{o.buyer?.name} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs ${statusColors[o.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                    {o.orderStatus}
                  </span>
                  <p className="text-sm font-bold text-gray-900">${o.pricing?.total?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
