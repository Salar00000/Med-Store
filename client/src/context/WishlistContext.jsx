import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);

function load() {
  try { return JSON.parse(localStorage.getItem('wishlist')) || []; } catch { return []; }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(load);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = useCallback((id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isWished = useCallback((id) => wishlist.includes(id), [wishlist]);

  const value = useMemo(() => ({ wishlist, toggle, isWished }), [wishlist, toggle, isWished]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
