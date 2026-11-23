import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { Fab } from './components/Fab.jsx';
import { Particles } from './components/Particles.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { useScrollEffects } from './hooks/useScrollEffects.js';

// Lazy-load route components for code-splitting and smaller initial bundle
const HomePage = lazy(() => import('./pages/HomePage.jsx').then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx').then((m) => ({ default: m.ProductsPage })));
const MedicinesPage = lazy(() => import('./pages/MedicinesPage.jsx').then((m) => ({ default: m.MedicinesPage })));
const CartPage = lazy(() => import('./pages/CartPage.jsx').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx').then((m) => ({ default: m.CheckoutPage })));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx').then((m) => ({ default: m.AuthPage })));
const AccountPage = lazy(() => import('./pages/AccountPage.jsx').then((m) => ({ default: m.AccountPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx').then((m) => ({ default: m.NotFoundPage })));

/** Loading fallback shown while a lazy route chunk is being fetched */
function PageLoader() {
  return (
    <div className="container" style={{
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="no-results" style={{ display: 'block', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
        <h3>Loading...</h3>
      </div>
    </div>
  );
}

export default function App() {
  useScrollEffects();
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearch(q);
  }, [location.search]);

  const submitSearch = (q) => {
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div id="scrollProgress"></div>
            <Particles />
            <Header search={search} onSearchChange={setSearch} onSearchSubmit={submitSearch} />
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage search={search} />} />
                  <Route path="/medicines" element={<MedicinesPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Footer />
            <Fab />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
