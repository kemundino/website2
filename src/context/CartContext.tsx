import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { MenuItem } from "@/data/menu";

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isGuest: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Get cart storage key based on user
const getCartStorageKey = (userId?: string): string => {
  if (userId) {
    return `bitebuzz_cart_${userId}`;
  }
  return 'bitebuzz_cart_guest';
};

// Load cart from localStorage
const getStoredCart = (userId?: string): CartItem[] => {
  try {
    const storageKey = getCartStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to load cart from localStorage:', err);
    return [];
  }
};

// Save cart to localStorage
const saveCart = (items: CartItem[], userId?: string) => {
  try {
    const storageKey = getCartStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
};

// Clear cart from localStorage
const clearStoredCart = (userId?: string) => {
  try {
    const storageKey = getCartStorageKey(userId);
    localStorage.removeItem(storageKey);
  } catch (err) {
    console.error('Failed to clear cart from localStorage:', err);
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user, isAuthenticated } = useAuth();
  const isGuest = !isAuthenticated;

  // Load cart from localStorage when user changes
  useEffect(() => {
    console.log('🛒 Loading cart for user:', user?.id || 'guest');
    const storedCart = getStoredCart(user?.id);
    console.log('📦 Loaded cart items:', storedCart.length);
    setItems(storedCart);
  }, [user?.id]);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      saveCart(items, user?.id);
      console.log('💾 Saved cart to localStorage for:', user?.id || 'guest', 'items:', items.length);
    } else {
      // Clear storage when cart is empty
      clearStoredCart(user?.id);
    }
  }, [items, user?.id]);

  // Transfer guest cart to user cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      const guestCart = getStoredCart(); // Guest cart (no userId)
      if (guestCart.length > 0) {
        console.log('🔄 Transferring guest cart to user cart:', guestCart.length, 'items');
        setItems(guestCart);
        clearStoredCart(); // Clear guest cart after transfer
      }
    }
  }, [isAuthenticated, user]);

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const updated = prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        console.log('➕ Updated item quantity:', item.name, 'new quantity:', existing.quantity + 1);
        return updated;
      }
      const updated = [...prev, { ...item, quantity: 1 }];
      console.log('🛒 Added new item to cart:', item.name);
      return updated;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      console.log('➖ Removed item from cart:', id);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const updated = prev.filter((i) => i.id !== id);
        console.log('🗑️ Removed item (quantity 0):', id);
        return updated;
      });
    } else {
      setItems((prev) => {
        const updated = prev.map((i) => (i.id === id ? { ...i, quantity } : i));
        console.log('🔄 Updated quantity:', id, 'to', quantity);
        return updated;
      });
    }
  }, []);

  const clearCart = useCallback(() => {
    console.log('🧹 Clearing cart for:', user?.id || 'guest');
    setItems([]);
    clearStoredCart(user?.id);
  }, [user?.id]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice,
      isGuest 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
