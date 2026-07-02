import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, Store, ArrowLeft } from 'lucide-react';

const navItems = [
  { to: '/vendor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/vendor/products', icon: Package, label: 'Products' },
  { to: '/vendor/orders', icon: ShoppingBag, label: 'Orders' },
];

export default function VendorLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <Store className="w-6 h-6 text-primary-600" />
            <span className="font-display text-xl font-bold text-gray-900">Bazario</span>
          </Link>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Vendor Portal</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }>
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
