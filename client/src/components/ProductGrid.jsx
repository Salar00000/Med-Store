import { ProductCard } from './ProductCard.jsx';

export function ProductGrid({ products, isWished, onAddToCart, onQuickView, onToggleWishlist }) {
  return (
    <div id="productsGrid" className="products-grid">
      {products.map((p, i) => (
        <ProductCard
          key={p._id}
          product={p}
          index={i}
          isWished={isWished(p._id)}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}
