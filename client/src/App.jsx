import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { Fab } from './components/Fab.jsx';
import { Particles } from './components/Particles.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ProductsPage } from './pages/ProductsPage.jsx';
import { MedicinesPage } from './pages/MedicinesPage.jsx';
import { useScrollEffects } from './hooks/useScrollEffects.js';

export default function App() {
  useScrollEffects();

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <div id="scrollProgress"></div>
          <Particles />
          <Header onSearch={() => {}} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage search="" />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
          <Footer />
          <Fab />
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
