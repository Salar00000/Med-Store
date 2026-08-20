import { describe, it, expect } from 'vitest';
import { formatPrice, discountPct, stars } from '../utils/format.js';

describe('format utils', () => {
  it('formats prices to 2 decimals', () => {
    expect(formatPrice(12.999)).toBe('$13.00');
    expect(formatPrice(5)).toBe('$5.00');
  });

  it('computes discount percentage', () => {
    expect(discountPct(12.99, 16.99)).toBe(24);
  });

  it('builds star strings', () => {
    expect(stars(4.8)).toBe('★★★★★');
    expect(stars(3.4)).toBe('★★★☆☆');
  });
});
