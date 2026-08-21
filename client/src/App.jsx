import { useEffect, useState } from 'react';
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
import { HomePage } from './pages/HomePage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { MedicinesPage } from './pages/MedicinesPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { AccountPage } from './pages/AccountPage.jsx';
import { useScrollEffects } from './hooks/useScrollEffects.js';

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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage search={search} />} />
              <Route path="/medicines" element={<MedicinesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="*" element={<HomePage />} />
            </Routes>
            <Footer />
            <Fab />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
