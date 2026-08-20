import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/format.js';

export function MiniCart({ open }) {
  const { items, subtotal } = useCart();
  return (
    <div id="miniCart" className={`mini-cart ${open ? 'active' : ''}`}>
      <div className="mini-cart-header">
        <h3>Your Cart</h3>
      </div>
      <div className="mini-cart-items">
        {items.length === 0 ? (
          <div className="mini-cart-empty"><p>Your cart is empty</p></div>
        ) : (
          items.map((i) => (
            <div className="mini-cart-item" key={i._id}>
              <div className="mini-cart-item-emoji">{i.emoji || '💊'}</div>
              <div className="mini-cart-item-info">
                <div className="mini-cart-item-title">{i.name}</div>
                <div className="mini-cart-item-price">{formatPrice(i.price)} × {i.qty}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mini-cart-footer">
        <div className="mini-cart-total"><span>Total:</span><span>{formatPrice(subtotal)}</span></div>
        <Link to="/cart" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>View Cart →</Link>
      </div>
    </div>
  );
}
