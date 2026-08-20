import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createOrder } from '../api/orders.js';
import { validatePromo } from '../api/promo.js';
import { formatPrice } from '../utils/format.js';

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 4.99;

const INITIAL = {
  fname: '', lname: '', email: '', phone: '', addr: '', city: '', zip: '',
};

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...INITIAL, email: user?.email || '' });
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  if (!user) {
    navigate('/auth?redirect=/checkout', { replace: true });
    return null;
  }

  if (items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  const discountedSub = subtotal - discount;
  const tax = discountedSub * TAX_RATE;
  const shipping = discountedSub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = discountedSub + tax + shipping;

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const { discountPercent } = await validatePromo(code);
      setDiscount((subtotal * discountPercent) / 100);
      showToast('10% discount applied!');
    } catch {
      setDiscount(0);
      showToast('Invalid promo code', 'error');
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await createOrder({
        items: items.map((i) => ({ productId: i._id, qty: i.qty })),
        shippingInfo: {
          fullName: `${form.fname} ${form.lname}`.trim(),
          email: form.email,
          address: form.addr,
          city: form.city,
          zip: form.zip,
        },
        promoCode: promoCode.trim() || undefined,
      });
      clearCart();
      document.getElementById('successOverlay').classList.add('active');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const validShipping = form.fname.trim().length >= 2 && form.lname.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.email) && form.addr.trim().length >= 2 && form.city.trim().length >= 2 && form.zip.trim().length >= 4;

  const stepClass = (n) => (n < step ? 'done' : n === step ? 'active' : '');

  return (
    <>
      <div className="container checkout-page">
        <div className="page-title">🔒 Secure Checkout</div>
        <div className="page-sub">Complete your order in 3 easy steps</div>

        <div className="steps">
          <div className={`step ${stepClass(1)}`}><div className="step-circ">1</div><div className="step-label">Shipping</div></div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${stepClass(2)}`}><div className="step-circ">2</div><div className="step-label">Payment</div></div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${stepClass(3)}`}><div className="step-circ">3</div><div className="step-label">Review</div></div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {step === 1 && (
              <div className="step-panel active">
                <div className="form-card">
                  <div className="form-card-title">📍 Shipping Information</div>
                  <div className="form-grid">
                    <div className="form-group"><label>First Name *</label><input type="text" value={form.fname} onChange={(e) => setForm({ ...form, fname: e.target.value })} placeholder="John" /></div>
                    <div className="form-group"><label>Last Name *</label><input type="text" value={form.lname} onChange={(e) => setForm({ ...form, lname: e.target.value })} placeholder="Doe" /></div>
                    <div className="form-group fg-full"><label>Email Address *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" /></div>
                    <div className="form-group fg-full"><label>Phone Number</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></div>
                    <div className="form-group fg-full"><label>Street Address *</label><input type="text" value={form.addr} onChange={(e) => setForm({ ...form, addr: e.target.value })} placeholder="123 Main Street" /></div>
                    <div className="form-group"><label>City *</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="New York" /></div>
                    <div className="form-group"><label>ZIP Code *</label><input type="text" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="10001" maxLength="10" /></div>
                  </div>
                </div>
                <div className="step-nav">
                  <Link to="/cart" className="btn btn-ghost">← Back</Link>
                  <button className="btn btn-primary" disabled={!validShipping} onClick={() => setStep(2)}>Continue to Payment →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-panel active">
                <div className="form-card">
                  <div className="form-card-title">💳 Payment Details</div>
                  <div className="form-grid">
                    <div className="form-group fg-full"><label>Cardholder Name *</label><input type="text" placeholder="John Doe" /></div>
                    <div className="form-group fg-full"><label>Card Number *</label><input type="text" placeholder="0000 0000 0000 0000" maxLength="19" /></div>
                    <div className="form-group"><label>Expiry Date *</label><input type="text" placeholder="MM / YY" maxLength="7" /></div>
                    <div className="form-group"><label>CVC *</label><input type="text" placeholder="123" maxLength="4" /></div>
                  </div>
                </div>
                <div className="step-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>Review Order →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-panel active">
                <div className="form-card">
                  <div className="form-card-title">📋 Review Your Order</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 2 }}>
                    <div><strong style={{ color: 'var(--primary)' }}>Name:</strong> {form.fname} {form.lname}</div>
                    <div><strong style={{ color: 'var(--primary)' }}>Email:</strong> {form.email}</div>
                    <div><strong style={{ color: 'var(--primary)' }}>Delivery Address:</strong> {form.addr}, {form.city} {form.zip}</div>
                    {promoCode.trim() && <div><strong style={{ color: 'var(--neon-green)' }}>Promo:</strong> {promoCode.trim().toUpperCase()} (-{formatPrice(discount)})</div>}
                  </div>
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-green)', fontWeight: 700, marginBottom: '0.3rem' }}>🔒 Your data is safe</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>256-bit SSL encryption • PCI-DSS compliant • GDPR protected</div>
                  </div>
                </div>
                <div className="step-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary" id="placeBtn" onClick={placeOrder} disabled={placing}>
                    {placing ? '⏳ Processing...' : '🎉 Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="order-sidebar">
            <div className="order-sidebar-title">Your Order</div>
            <div id="orderList">
              {items.map((i) => (
                <div className="order-item-row" key={i._id}>
                  <span className="order-item-name">{i.qty}× {i.name}</span>
                  <span className="order-item-price">{formatPrice(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="promo-input" style={{ margin: '1rem 0' }}>
              <input className="promo-field" type="text" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              <button className="promo-btn" onClick={applyPromo}>Apply</button>
            </div>
            <div className="order-divider"></div>
            <div className="order-item-row"><span className="order-item-name">Subtotal</span><span className="order-item-price">{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="order-item-row"><span className="order-item-name">Discount</span><span className="order-item-price" style={{ color: 'var(--neon-green)' }}>-{formatPrice(discount)}</span></div>}
            <div className="order-item-row"><span className="order-item-name">Tax (5%)</span><span className="order-item-price">{formatPrice(tax)}</span></div>
            <div className="order-item-row"><span className="order-item-name">Shipping</span><span className="order-item-price">{shipping === 0 ? '🎉 Free' : formatPrice(shipping)}</span></div>
            <div className="order-divider"></div>
            <div className="order-total-row"><span>Total</span><span>{formatPrice(total)}</span></div>
            <div className="security-note">🔒 256-bit SSL encryption</div>
          </div>
        </div>
      </div>

      <div className="success-overlay" id="successOverlay">
        <div className="success-icon">✅</div>
        <h2 style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Order Confirmed!</h2>
        <p>Your healthcare essentials are on the way. Check your email for updates.</p>
        <Link to="/" className="btn btn-primary">Continue Shopping →</Link>
      </div>
    </>
  );
}
