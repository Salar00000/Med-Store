import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import { validatePromo } from '../api/promo.js';

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 4.99;

export function CartPage() {
  const { items, updateQty, removeItem, subtotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const showToast = useToast();
  const navigate = useNavigate();

  const discountedSub = subtotal - discount;
  const tax = discountedSub * TAX_RATE;
  const shipping = items.length === 0 ? 0 : discountedSub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = discountedSub + tax + shipping;
  const pct = Math.min((discountedSub / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - discountedSub, 0);

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

  const proceedToCheckout = () => {
    if (items.length === 0) {
      showToast('Cart is empty!', 'error');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container cart-page">
      <div className="cart-page-title">🛒 Shopping Cart</div>
      <div className="cart-page-sub">Review your items before checkout</div>

      <div className="cart-layout">
        <div className="cart-list" id="cartItems">
          {items.length === 0 ? (
            <div className="empty-cart fade-in visible">
              <div className="empty-cart-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some amazing healthcare products to get started.</p>
              <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex' }}>🛍️ Start Shopping</Link>
            </div>
          ) : (
            items.map((item, i) => (
              <div className="cart-item" style={{ animationDelay: `${i * 0.1}s` }} key={item._id}>
                <div className="item-emoji">{item.emoji || '💊'}</div>
                <div className="item-info">
                  <div className="item-title">{item.name}</div>
                  <div className="item-category">{item.category || 'Healthcare'}</div>
                  <div className="item-price">{formatPrice(item.price)}</div>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateQty(item._id, -1)} aria-label="Decrease quantity">−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item._id, 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.8rem' }}>{formatPrice(item.price * item.qty)}</div>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>🗑️ Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="summary-card">
          <div className="summary-title">Order Summary</div>

          <div className="shipping-bar">
            <div className="shipping-bar-label">Free shipping: <span>{shipping === 0 && items.length > 0 ? '🎉 Free shipping unlocked!' : `${formatPrice(remaining)} away`}</span></div>
            <div className="shipping-bar-track"><div className="shipping-bar-fill" id="shippingFill" style={{ width: `${pct}%` }}></div></div>
          </div>

          <div className="promo-input">
            <input className="promo-field" type="text" id="promoCode" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
            <button className="promo-btn" onClick={applyPromo}>Apply</button>
          </div>

          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="summary-row"><span>Discount</span><span style={{ color: 'var(--neon-green)' }}>-{formatPrice(discount)}</span></div>}
          <div className="summary-row"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 && items.length > 0 ? '🎉 Free!' : formatPrice(shipping)}</span></div>
          <div className="summary-row total-row"><span>Total</span><span>{formatPrice(total)}</span></div>

          <button onClick={proceedToCheckout} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
            Proceed to Checkout →
          </button>
          <Link to="/products" className="continue-link">← Continue Shopping</Link>
          {items.length > 0 && (
            <button className="continue-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { clearCart(); setDiscount(0); }}>
              Clear cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
