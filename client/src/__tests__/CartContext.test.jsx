import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext.jsx';

const product = { _id: 'p1', name: 'Test', price: 10, emoji: 'x', category: 'Medicine', desc: 'd', originalPrice: 12, rating: 4, reviews: 1 };

function Probe() {
  const { items, count, subtotal, addItem, updateQty, removeItem } = useCart();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <button onClick={() => addItem(product)}>add</button>
      <button onClick={() => updateQty('p1', 1)}>inc</button>
      <button onClick={() => removeItem('p1')}>remove</button>
      <span data-testid="qty">{items[0]?.qty ?? 0}</span>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => localStorage.clear());

  it('adds items and accumulates quantity', () => {
    render(<CartProvider><Probe /></CartProvider>);
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('qty').textContent).toBe('2');
    expect(screen.getByTestId('subtotal').textContent).toBe('20');
  });

  it('updates and removes items', () => {
    render(<CartProvider><Probe /></CartProvider>);
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('inc'));
    expect(screen.getByTestId('qty').textContent).toBe('2');
    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
