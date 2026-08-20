import { useCallback, useEffect, useState } from 'react';
import { fetchProducts } from '../api/products.js';
import { ProductGrid } from '../components/ProductGrid.jsx';
import { ProductModal } from '../components/ProductModal.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';

const CATEGORIES = ['all', 'Medicine', 'Vitamins', 'Devices', 'Protection', 'Essentials'];

export function ProductsPage({ search }) {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalId, setModalId] = useState(null);
  const debouncedSearch = useDebounce(search, 250);

  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const showToast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchProducts({ category, search: debouncedSearch, sort });
      setProducts(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch, sort]);

  useEffect(() => { load(); }, [load]);

  const onAddToCart = useCallback((product) => {
    addItem(product);
    showToast(`${product.name} added to cart`);
  }, [addItem, showToast]);

  return (
    <div className="container products-section" id="products" style={{ paddingTop: '3rem' }}>
      <div className="section-header fade-in visible">
        <div className="section-tag">CATALOGUE</div>
        <h2 className="section-title">Featured <span>Products</span></h2>
        <p className="section-desc">Handpicked essentials for your health and wellness journey</p>
      </div>

      <div className="category-pills" id="categoryPills">
        {CATEGORIES.map((c) => (
          <button key={c} className={`pill ${category === c ? 'active' : ''}`} data-category={c} onClick={() => setCategory(c)}>
            {c === 'all' ? 'All Products' : c}
          </button>
        ))}
      </div>

      <div className="products-controls">
        <div className="results-count">Showing <span>{products.length}</span> products</div>
        <select id="sortSelect" className="filter-select" aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sort by</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low → High)</option>
          <option value="price-desc">Price (High → Low)</option>
        </select>
      </div>

      {loading && <div className="no-results" style={{ display: 'block' }}><h3>Loading products...</h3></div>}
      {error && (
        <div className="no-results" style={{ display: 'block' }}>
          <h3>Could not load products</h3>
          <p>Check that the API is running.</p>
          <button className="btn btn-primary" onClick={load} style={{ display: 'inline-flex' }}>Retry</button>
        </div>
      )}
      {!loading && !error && products.length === 0 && (
        <div id="noResults" className="no-results" style={{ display: 'block' }}>
          <div className="no-results-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
      {!loading && !error && products.length > 0 && (
        <ProductGrid
          products={products}
          isWished={isWished}
          onAddToCart={onAddToCart}
          onQuickView={setModalId}
          onToggleWishlist={toggle}
        />
      )}

      {modalId && <ProductModal productId={modalId} onClose={() => setModalId(null)} onAddToCart={onAddToCart} />}
    </div>
  );
}
