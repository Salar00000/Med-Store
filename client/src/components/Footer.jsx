import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer id="about" className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="logo" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
              <span className="logo-icon">🏥</span>
              <h1>MediCare</h1>
            </Link>
            <p>Your trusted partner in health and wellness since 2005. Bringing pharmaceutical-grade care to your doorstep.</p>
            <div className="footer-socials">
              <a href="#" className="social-btn" aria-label="Facebook">📘</a>
              <a href="#" className="social-btn" aria-label="Twitter">🐦</a>
              <a href="#" className="social-btn" aria-label="Instagram">📸</a>
              <a href="#" className="social-btn" aria-label="LinkedIn">💼</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/medicines">Medicines Info</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/checkout">Checkout</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            <div className="footer-links">
              <Link to="/products">Medicines</Link>
              <Link to="/products">Vitamins</Link>
              <Link to="/products">Devices</Link>
              <Link to="/products">Protection</Link>
              <Link to="/products">Essentials</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="footer-contact-item"><span>📧</span> support@medicare.com</div>
            <div className="footer-contact-item"><span>📞</span> +1 (800) 123-4567</div>
            <div className="footer-contact-item"><span>📍</span> 123 Health St, NY</div>
            <div className="footer-contact-item"><span>🕐</span> 24/7 Available</div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="copyright">© 2026 MediCare Inc. All rights reserved.</div>
          <div className="footer-badges">
            <div className="footer-badge">🔐 SSL Secured</div>
            <div className="footer-badge">✅ FDA Approved</div>
            <div className="footer-badge">💳 PCI Compliant</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
