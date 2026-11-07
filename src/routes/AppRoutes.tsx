import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AllProductsPage } from '@/pages/AllProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderHistoryPage } from '@/pages/OrderHistoryPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { PaymentResultPage } from '@/pages/PaymentResultPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminHeroShowcasePage } from '@/pages/admin/AdminHeroShowcasePage';
import { AdminChatInboxPage } from '@/pages/admin/AdminChatInboxPage';

const auth = (page: ReactNode) => <AuthLayout>{page}</AuthLayout>;

export function AppRoutes() {
  return (
    <Routes>
      {/* Main Clean Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<AllProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Additional Clean Routes (No hash in URL) */}
      <Route path="/projects" element={<PlaceholderPage title="Agricultural Projects & Partners" />} />
      <Route path="/experience" element={<PlaceholderPage title="Agri-Go Farm Experiences" />} />
      <Route path="/stack" element={<PlaceholderPage title="Agriculture Standards & Technology" />} />
      <Route path="/terminal" element={<PlaceholderPage title="Agri-Go Distribution Network" />} />

      {/* Auth Routes */}
      <Route path="/login" element={auth(<LoginPage />)} />
      <Route path="/register" element={auth(<RegisterPage />)} />
      <Route path="/verify-email" element={auth(<VerifyEmailPage />)} />
      <Route path="/forgot-password" element={auth(<ForgotPasswordPage />)} />
      <Route path="/reset-password" element={auth(<ResetPasswordPage />)} />

      {/* Customer Protected Routes */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute roles={['customer', 'admin']}><CartPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute roles={['customer', 'admin']}><CheckoutPage /></ProtectedRoute>} />
      <Route path="/payment/result" element={<PaymentResultPage />} />
      <Route path="/orders" element={<ProtectedRoute roles={['customer', 'admin']}><OrderHistoryPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute roles={['customer', 'admin']}><OrderDetailPage /></ProtectedRoute>} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<Navigate replace to="/admin/products" />} />
      <Route path="/admin/products" element={<ProtectedRoute roles={['admin']}><AdminProductsPage /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute roles={['admin']}><AdminInventoryPage /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategoriesPage /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrdersPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/chat" element={<ProtectedRoute roles={['admin']}><AdminChatInboxPage /></ProtectedRoute>} />
      <Route path="/admin/hero-showcase" element={<ProtectedRoute roles={['admin']}><AdminHeroShowcasePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
