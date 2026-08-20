import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { MiniCart } from './MiniCart.jsx';

export function Header({ onSearch }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [search, setSearch] = useState('');
  const [miniOpen, setMiniOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearch('');
    onSearch?.('');
  }, [location.pathname, onSearch]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} id="siteHeader">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">🏥</span>
          <h1>MediCare</h1>
        </Link>
        <nav className="nav">
          <button className={`mobile-menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
          <ul className={`nav-links ${menuOpen ? 'active' : ''}`} id="navLinks">
            <li><Link to="/" className="nav-link active">Home</Link></li>
            <li><Link to="/medicines" className="nav-link">Medicines Info</Link></li>
            <li><Link to="/products" className="nav-link">Products</Link></li>
            <li><Link to="/account" className="nav-link">My Orders</Link></li>
          </ul>
          <div className="nav-actions">
            <div className="search-container">
              <input
                type="text"
                className={`search-input ${searchActive || search ? 'active' : ''}`}
                placeholder="Search products..."
                aria-label="Search products"
                value={search}
                onChange={(e) => { setSearch(e.target.value); onSearch?.(e.target.value); }}
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
              />
              <button className="search-btn" aria-label="Search" onClick={() => setSearchActive(true)}>🔍</button>
            </div>
            <Link
              to="/cart"
              className="cart-btn"
              aria-label="View Cart"
              onMouseEnter={() => setMiniOpen(true)}
              onMouseLeave={() => setMiniOpen(false)}
            >
              🛒 <span className="cart-count" style={{ display: count === 0 ? 'none' : 'flex' }}>{count}</span>
            </Link>
          </div>
        </nav>
      </div>
      <MiniCart open={miniOpen} />
    </header>
  );
}
