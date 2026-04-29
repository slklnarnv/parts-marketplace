import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { getUserCart, saveUserCart } from "./services/cartService";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const initialLoadDone = useRef(false);

  // Sync with Firestore on user login
  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        try {
          const remoteCart = await getUserCart(user.email);
          // Merge logic: local cart takes precedence for new items, but we can just use remote if local is empty
          if (remoteCart.length > 0 && cart.length === 0) {
            setCart(remoteCart);
          } else if (cart.length > 0) {
            // Push local to remote
            await saveUserCart(user.email, cart);
          }
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
      initialLoadDone.current = true;
    };
    syncCart();
  }, [user]);

  // Persist to localStorage and Firestore when cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    if (user && initialLoadDone.current) {
      saveUserCart(user.email, cart).catch(err => console.error("Failed to save cart to DB", err));
    }
  }, [cart, user]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, item.count) } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart.filter((i) => i.id !== id);
    });
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (item, newQuantity) => {
    setCart((prevCart) => {
      const quantity = Math.max(0, Math.min(parseInt(newQuantity) || 0, item.count));
      const existingItem = prevCart.find((i) => i.id === item.id);

      if (quantity === 0) {
        return prevCart.filter((i) => i.id !== item.id);
      }

      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity } : i
        );
      }
      
      return [...prevCart, { ...item, quantity }];
    });
  };

  const getItemQuantity = (id) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getItemQuantity, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
