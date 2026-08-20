import { useEffect, useRef, useState } from 'react';
import { fetchProducts } from '../api/products.js';
import { ProductGrid } from '../components/ProductGrid.jsx';
import { ProductModal } from '../components/ProductModal.jsx';
import NewsletterForm from '../components/NewsletterForm.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useCountUp } from '../hooks/useCountUp.js';

const TYPING_PHRASES = ['Our Priority.', 'Our Mission.', 'Our Commitment.', 'Our Promise.'];

function TypingText() {
  const [text, setText] = useState('');
  const idx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    let t;
    const type = () => {
      const current = TYPING_PHRASES[idx.current];
      if (!deleting.current) {
        charIdx.current += 1;
        setText(current.slice(0, charIdx.current));
        if (charIdx.current === current.length) {
          deleting.current = true;
          t = setTimeout(type, 2000);
          return;
        }
      } else {
        charIdx.current -= 1;
        setText(current.slice(0, charIdx.current));
        if (charIdx.current === 0) {
          deleting.current = false;
          idx.current = (idx.current + 1) % TYPING_PHRASES.length;
          t = setTimeout(type, 300);
          return;
        }
      }
      t = setTimeout(type, deleting.current ? 60 : 100);
    };
    t = setTimeout(type, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <span className="typing-wrapper">
      <span className="highlight-text" id="typingText">{text}</span><span className="typing-cursor"></span>
    </span>
  );
}

function Stat({ target, suffix, label }) {
  const value = useCountUp(target, suffix);
  return (
    <div className="stat-item">
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-divider"></div>
    </div>
  );
}

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalId, setModalId] = useState(null);
  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const showToast = useToast();

  useEffect(() => {
    fetchProducts({})
      .then(setProducts)
      .catch(() => showToast('Could not load products', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const onAddToCart = (product) => {
    addItem(product);
    showToast(`${product.name} added to cart`);
  };

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-mesh"></div>
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Trusted By 10,000+ Patients
            </div>
            <h2>
              Your Health,<br />
              <TypingText />
            </h2>
            <p>Experience the new standard in online healthcare. Authentic medicines, rapid delivery, and expert consultations at your fingertips — all in one premium platform.</p>
            <div className="hero-btns">
              <a href="#featured" className="btn btn-primary">🛍️ Shop Now</a>
              <a href="#about" className="btn btn-outline">Learn More</a>
            </div>
            <div className="hero-trust">
              <div className="trust-item"><span className="check">✓</span> FDA Approved</div>
              <div className="trust-item"><span className="check">✓</span> Secure Payments</div>
              <div className="trust-item"><span className="check">✓</span> Free Returns</div>
            </div>
          </div>
          <div className="hero-visual" id="heroVisual">
            <div className="float-card">
              <div className="float-icon">🌡️</div>
              <div className="float-info">
                <h3>New Arrival</h3>
                <p>Advanced Smart Thermometers</p>
              </div>
              <div className="float-badge">Just In</div>
            </div>
            <div className="float-card card-2">
              <div className="float-icon">🍊</div>
              <div className="float-info">
                <h3>Special Offer</h3>
                <p>20% off Immunity Boosters</p>
              </div>
              <div className="float-badge">-20%</div>
            </div>
            <div className="float-card card-3">
              <div className="float-icon">🚚</div>
              <div className="float-info">
                <h3>Fast Delivery</h3>
                <p>Free shipping on orders $50+</p>
              </div>
              <div className="float-badge">Free</div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section fade-in">
        <div className="container">
          <div className="stats-grid">
            <Stat target={10000} suffix="+" label="Happy Customers" />
            <Stat target={500} suffix="+" label="Products Available" />
            <Stat target={98} suffix="%" label="Satisfaction Rate" />
            <Stat target={24} suffix="/7" label="Expert Support" />
          </div>
        </div>
      </section>

      <section className="features-band">
        <div className="container features-grid">
          <div className="feature-item fade-in stagger-1">
            <i>⚡</i>
            <h3>Fast Delivery</h3>
            <p>Same-day shipping available in select areas</p>
          </div>
          <div className="feature-item fade-in stagger-2">
            <i>🛡️</i>
            <h3>100% Secure</h3>
            <p>Safe payments & data protection</p>
          </div>
          <div className="feature-item fade-in stagger-3">
            <i>🎧</i>
            <h3>24/7 Support</h3>
            <p>Expert pharmacists always online</p>
          </div>
          <div className="feature-item fade-in stagger-4">
            <i>✅</i>
            <h3>Certified Quality</h3>
            <p>All products FDA-verified & authentic</p>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="container">
          <div className="trust-badges">
            <div className="trust-badge"><span className="trust-badge-icon">🏅</span> FDA Approved Products</div>
            <div className="trust-badge"><span className="trust-badge-icon">🔐</span> SSL Encrypted Checkout</div>
            <div className="trust-badge"><span className="trust-badge-icon">🚚</span> Free Shipping Over $50</div>
            <div className="trust-badge"><span className="trust-badge-icon">💊</span> Licensed Pharmacy</div>
            <div className="trust-badge"><span className="trust-badge-icon">🔄</span> 30-Day Free Returns</div>
          </div>
        </div>
      </section>

      <section id="featured" className="products-section">
        <div className="container">
          <div className="section-header fade-in">
            <div className="section-tag">✦ CATALOGUE</div>
            <h2 className="section-title">Featured <span>Products</span></h2>
            <p className="section-desc">Handpicked essentials for your health and wellness journey</p>
          </div>
          {loading && <div className="no-results" style={{ display: 'block' }}><h3>Loading products...</h3></div>}
          {!loading && products.length > 0 && (
            <ProductGrid
              products={products}
              isWished={isWished}
              onAddToCart={onAddToCart}
              onQuickView={setModalId}
              onToggleWishlist={toggle}
            />
          )}
        </div>
      </section>

      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header fade-in">
            <div className="section-tag">✦ REVIEWS</div>
            <h2 className="section-title">What Our <span>Customers Say</span></h2>
            <p className="section-desc">Real stories from real patients who trust MediCare</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card fade-in stagger-1">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"MediCare has completely transformed how I manage my family's healthcare. The delivery is incredibly fast and every product is genuine. I'll never order from anywhere else!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">SA</div>
                <div>
                  <div className="author-name">Sarah Ahmed</div>
                  <div className="author-role">Verified Customer · Dubai</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card fade-in stagger-2">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"As a nurse, I recommend MediCare to all my patients. The product quality and accuracy of information is outstanding. Their 24/7 pharmacist support is a life-saver."</p>
              <div className="testimonial-author">
                <div className="author-avatar">MK</div>
                <div>
                  <div className="author-name">Maria Khan</div>
                  <div className="author-role">Registered Nurse · Karachi</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card fade-in stagger-3">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"The interface is beautiful and so easy to use. Got my blood pressure monitor delivered same-day. Incredible service — feels like healthcare from the future!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">JR</div>
                <div>
                  <div className="author-name">James Rodriguez</div>
                  <div className="author-role">Verified Customer · London</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card fade-in">
            <h2>Stay Healthy, Stay Informed</h2>
            <p>Subscribe for exclusive deals, health tips, and new product launches delivered to your inbox.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {modalId && <ProductModal productId={modalId} onClose={() => setModalId(null)} onAddToCart={onAddToCart} />}
    </>
  );
}
