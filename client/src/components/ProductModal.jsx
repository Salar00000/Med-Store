import { useEffect, useState } from 'react';
import { fetchProduct } from '../api/products.js';
import { formatPrice, stars } from '../utils/format.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function ProductModal({ productId, onClose, onAddToCart }) {
  const [product, setProduct] = useState(null);
  const { isWished, toggle } = useWishlist();
  const showToast = useToast();

  useEffect(() => {
    if (!productId) return;
    fetchProduct(productId)
      .then(setProduct)
      .catch(() => showToast('Could not load product', 'error'));
  }, [productId, showToast]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!product) return null;

  return (
    <div id="productModal" className="modal active" aria-hidden="false">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        <div className="modal-body">
          <div className="modal-product-content">
            <div className="modal-product-image">{product.emoji}</div>
            <div className="modal-product-info">
              <div className="product-category-tag" style={{ position: 'relative', top: 'auto', left: 'auto', display: 'inline-block', marginBottom: '0.8rem' }}>{product.category}</div>
              <h2>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.5rem 0' }}>
                <span className="stars">{stars(product.rating)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.reviews} reviews)</span>
              </div>
              <div className="price">{formatPrice(product.price)} <span className="price-original" style={{ fontSize: '1.1rem' }}>{formatPrice(product.originalPrice)}</span></div>
              <p className="product-desc">{product.desc}</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => { onAddToCart(product); onClose(); }} style={{ flex: 1 }}>Add to Cart</button>
                <button className="wishlist-btn active" style={{ position: 'relative', width: '50px', height: '50px' }} onClick={() => toggle(product._id)} aria-label="Wishlist">{isWished(product._id) ? '❤️' : '🤍'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
