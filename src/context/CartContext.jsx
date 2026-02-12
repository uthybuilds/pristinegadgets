import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("pristine_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("pristine_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant = null, quantityToAdd = 1) => {
    // Check stock BEFORE setting state to ensure immediate return value
    const existingItem = cart.find(
      (item) =>
        item.id === product.id &&
        JSON.stringify(item.variant) === JSON.stringify(variant),
    );

    const currentQty = existingItem ? existingItem.quantity : 0;
    if (
      product.stock !== undefined &&
      currentQty + quantityToAdd > product.stock
    ) {
      return false;
    }

    setCart((prev) => {
      const isExisting = prev.find(
        (item) =>
          item.id === product.id &&
          JSON.stringify(item.variant) === JSON.stringify(variant),
      );

      if (isExisting) {
        return prev.map((item) =>
          item.id === product.id &&
          JSON.stringify(item.variant) === JSON.stringify(variant)
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item,
        );
      }

      return [...prev, { ...product, variant, quantity: quantityToAdd }];
    });

    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (productId, variant = null) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === productId &&
            JSON.stringify(item.variant) === JSON.stringify(variant)
          ),
      ),
    );
  };

  const updateQuantity = (productId, variant, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prev) => {
      const item = prev.find(
        (i) =>
          i.id === productId &&
          JSON.stringify(i.variant) === JSON.stringify(variant),
      );

      // Stock check
      if (item && item.stock !== undefined && newQuantity > item.stock) {
        return prev;
      }

      return prev.map((item) =>
        item.id === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
          ? { ...item, quantity: newQuantity }
          : item,
      );
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
