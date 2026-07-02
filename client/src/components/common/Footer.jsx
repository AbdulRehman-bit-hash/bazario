import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-6 h-6 text-primary-400" />
            <span className="font-display text-xl font-bold text-white">Bazario</span>
          </div>
          <p className="text-sm leading-relaxed">The marketplace where thousands of vendors meet millions of buyers.</p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-primary-400 transition">All Products</Link></li>
            <li><Link to="/products?featured=true" className="hover:text-primary-400 transition">Featured</Link></li>
            <li><Link to="/products?sort=-sold" className="hover:text-primary-400 transition">Best Sellers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Sell</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/become-vendor" className="hover:text-primary-400 transition">Become a Vendor</Link></li>
            <li><Link to="/vendor" className="hover:text-primary-400 transition">Vendor Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-primary-400 transition cursor-pointer">Help Center</span></li>
            <li><span className="hover:text-primary-400 transition cursor-pointer">Contact Us</span></li>
            <li><span className="hover:text-primary-400 transition cursor-pointer">Privacy Policy</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} Bazario. All rights reserved.
      </div>
    </footer>
  );
}
