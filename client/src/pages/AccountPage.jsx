import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../api/orders.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';

export function AccountPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(() => showToast('Could not load orders', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem', minHeight: '60vh' }}>
      <div className="section-header fade-in visible">
        <div className="section-tag">ACCOUNT</div>
        <h2 className="section-title">My <span>Orders</span></h2>
        <p className="section-desc">Signed in as <strong>{user?.email}</strong></p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/products" className="btn btn-primary">🛍️ Continue Shopping</Link>
        <button className="btn btn-ghost" onClick={() => { logout(); showToast('Signed out'); }}>Sign Out</button>
      </div>

      {loading && <div className="no-results" style={{ display: 'block' }}><h3>Loading orders...</h3></div>}

      {!loading && orders.length === 0 && (
        <div className="empty-cart fade-in visible">
          <div className="empty-cart-icon">📦</div>
          <h3>No orders yet</h3>
          <p>When you place an order, it will show up here.</p>
        </div>
      )}

      {!loading && orders.map((order) => (
        <div className="cart-item" key={order._id} style={{ marginBottom: '1rem' }}>
          <div className="item-info">
            <div className="item-title">Order #{order._id.slice(-8)}</div>
            <div className="item-category">{new Date(order.createdAt).toLocaleDateString()} · {order.status}</div>
            <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>{formatPrice(order.total)}</div>
            {order.promoCode && <div className="item-category" style={{ marginBottom: 0 }}>{order.promoCode}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
