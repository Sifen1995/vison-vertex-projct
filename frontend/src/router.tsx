import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { MfaSetupPage } from './pages/auth/MfaSetupPage';
import { MfaVerifyPage } from './pages/auth/MfaVerifyPage';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProductDetailPage } from './pages/products/ProductDetailPage';

// Protected Pages
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { OrderSuccessPage } from './pages/checkout/OrderSuccessPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { OrderDetailPage } from './pages/orders/OrderDetailPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminAddProduct } from './pages/admin/AdminAddProduct';
import { AdminEditProduct } from './pages/admin/AdminEditProduct';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'mfa/setup', element: <ProtectedRoute><MfaSetupPage /></ProtectedRoute> },
      { path: 'mfa/verify', element: <MfaVerifyPage /> },
      {
        path: 'checkout',
        element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
      },
      {
        path: 'order-success',
        element: <ProtectedRoute><OrderSuccessPage /></ProtectedRoute>,
      },
      {
        path: 'orders',
        element: <ProtectedRoute><OrdersPage /></ProtectedRoute>,
      },
      {
        path: 'orders/:id',
        element: <ProtectedRoute><OrderDetailPage /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'products/add', element: <AdminAddProduct /> },
      { path: 'products/edit/:id', element: <AdminEditProduct /> },
      { path: 'orders', element: <AdminOrders /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
