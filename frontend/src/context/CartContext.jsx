import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product, quantity = 1, size = null, color = null) => {
    setItems(prev => {
      const key = `${product.id}-${size}-${color}`;
      const existing = prev.find(i => `${i.product.id}-${i.size}-${i.color}` === key);
      if (existing) {
        return prev.map(i => `${i.product.id}-${i.size}-${i.color}` === key
          ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product, quantity, size, color }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId, size, color) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size && i.color === color)));
  }, []);

  const updateQuantity = useCallback((productId, size, color, quantity) => {
    if (quantity <= 0) { removeItem(productId, size, color); return; }
    setItems(prev => prev.map(i =>
      i.product.id === productId && i.size === size && i.color === color ? { ...i, quantity } : i
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
