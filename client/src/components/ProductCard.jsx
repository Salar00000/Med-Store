import { formatPrice, discountPct, stars } from '../utils/format.js';

export function ProductCard({ product, isWished, onAddToCart, onQuickView, onToggleWishlist, index = 0 }) {
  const discount = discountPct(product.price, product.originalPrice);
  return (
    <div className="product-card fade-in visible" style={{ transitionDelay: `${index * 0.07}s` }} data-id={product._id}>
      <div className="card-shine"></div>
      <div className="product-category-tag">{product.category}</div>
      <button
        className={`wishlist-btn ${isWished ? 'active' : ''}`}
        onClick={() => onToggleWishlist(product._id)}
        aria-label="Wishlist"
      >
        {isWished ? '❤️' : '🤍'}
      </button>
      <button className="quick-view-btn" onClick={() => onQuickView(product._id)}>Quick View 👁️</button>
      <div className="product-img-box" onClick={() => onQuickView(product._id)}>
        <span className="product-emoji-wrap">{product.emoji}</span>
      </div>
      <div className="product-details">
        <div className="product-title" onClick={() => onQuickView(product._id)}>{product.name}</div>
        <div className="product-desc">{product.desc}</div>
        <div className="product-rating">
          <span className="stars">{stars(product.rating)}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>
        <div className="product-footer">
          <div>
            <div className="price">{formatPrice(product.price)}</div>
            {product.originalPrice > product.price && (
              <div className="price-original">{formatPrice(product.originalPrice)} <span style={{ color: '#39ff14', fontSize: '0.75rem', marginLeft: '4px' }}>-{discount}%</span></div>
            )}
          </div>
          <button className="add-btn" onClick={() => onAddToCart(product)}>+ Add</button>
        </div>
      </div>
    </div>
  );
}
