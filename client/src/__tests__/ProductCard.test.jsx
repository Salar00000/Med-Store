import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../components/ProductCard.jsx';

const product = {
  _id: 'p1', name: 'Advanced Pain Relief', price: 12.99, originalPrice: 16.99,
  category: 'Medicine', emoji: 'x', desc: 'Fast relief', rating: 4.8, reviews: 234,
};

describe('ProductCard', () => {
  it('renders product details', () => {
    render(<ProductCard product={product} isWished={false} onAddToCart={() => {}} onQuickView={() => {}} onToggleWishlist={() => {}} />);
    expect(screen.getByText('Advanced Pain Relief')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('Medicine')).toBeInTheDocument();
    expect(screen.getByText('-24%')).toBeInTheDocument();
  });
});
