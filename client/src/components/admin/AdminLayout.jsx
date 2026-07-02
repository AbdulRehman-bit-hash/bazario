import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Store, ShoppingBag, ArrowLeft, Shield } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/vendors', icon: Store, label: 'Vendors' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-primary-400" />
            <span className="font-display text-xl font-bold text-white">Bazario</span>
          </div>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }>
              <Icon className="w-4 h-4" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}
