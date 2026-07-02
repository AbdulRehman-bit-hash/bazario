import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import MainLayout from './components/common/MainLayout.jsx';
import VendorLayout from './components/vendor/VendorLayout.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

// Buyer pages
import HomePage from './pages/buyer/HomePage.jsx';
import ProductsPage from './pages/buyer/ProductsPage.jsx';
import ProductDetailPage from './pages/buyer/ProductDetailPage.jsx';
import CartPage from './pages/buyer/CartPage.jsx';
import CheckoutPage from './pages/buyer/CheckoutPage.jsx';
import OrdersPage from './pages/buyer/OrdersPage.jsx';
import VendorShopPage from './pages/buyer/VendorShopPage.jsx';
import WishlistPage from './pages/buyer/WishlistPage.jsx';

// Auth pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Vendor pages
import VendorDashboard from './pages/vendor/VendorDashboard.jsx';
import VendorProducts from './pages/vendor/VendorProducts.jsx';
import VendorOrders from './pages/vendor/VendorOrders.jsx';
import VendorRegister from './pages/vendor/VendorRegister.jsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminVendors from './pages/admin/AdminVendors.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';

// Protected route component
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/shop/:slug" element={<VendorShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Buyer protected */}
       <Route path="/checkout" element={
  <ProtectedRoute roles={['buyer', 'vendor']}>
    <CheckoutPage />
  </ProtectedRoute>
} />
<Route path="/orders" element={
  <ProtectedRoute roles={['buyer', 'vendor']}>
    <OrdersPage />
  </ProtectedRoute>
} />
<Route path="/wishlist" element={
  <ProtectedRoute roles={['buyer', 'vendor']}>
    <WishlistPage />
  </ProtectedRoute>
} />
        <Route path="/become-vendor" element={
          <ProtectedRoute>
            <VendorRegister />
          </ProtectedRoute>
        } />
      </Route>

      {/* Vendor dashboard */}
      <Route path="/vendor" element={
        <ProtectedRoute roles={['vendor']}>
          <VendorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="orders" element={<VendorOrders />} />
      </Route>

      {/* Admin dashboard */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
