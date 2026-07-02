import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Heart, User, Store, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice.js';
import { selectCartCount } from '../../store/slices/cartSlice.js';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Store className="w-7 h-7 text-primary-600" />
            <span className="font-display text-2xl font-bold text-gray-900">Bazario</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, vendors..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
              />
            </div>
          </form>

          {/* Actions */}
          <nav className="flex items-center gap-1">
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/wishlist" className="p-2 rounded-lg hover:bg-gray-100 transition">
                  <Heart className="w-5 h-5 text-gray-700" />
                </Link>

                <div className="relative ml-1">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    {user.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.name?.split(' ')[0]}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      {user.role === 'vendor' && (
                        <Link to="/vendor" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard className="w-4 h-4" /> Vendor Dashboard
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      {user.role === 'buyer' && (
                        <>
                          <Link to="/orders" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <User className="w-4 h-4" /> My Orders
                          </Link>
                          <Link to="/become-vendor" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Store className="w-4 h-4" /> Become a Vendor
                          </Link>
                        </>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600 px-3 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
