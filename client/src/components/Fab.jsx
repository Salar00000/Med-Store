import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export function Fab() {
  const { count } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Link
      to="/cart"
      className="fab"
      aria-label="Go to Cart"
      style={{ display: visible || count > 0 ? 'flex' : 'none' }}
    >
      🛒
    </Link>
  );
}
