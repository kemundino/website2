import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';

export interface UnifiedItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
  rating: number;
  prepTime: string;
  spicy?: boolean;
  isVeg?: boolean;
  isBestseller?: boolean;
  tag: 'regular' | 'custom' | 'special';
  createdAt: string;
  updatedAt: string;
}

interface UnifiedItemsContextType {
  items: UnifiedItem[];
  addItem: (item: Omit<UnifiedItem, 'id' | 'createdAt' | 'updatedAt'>) => UnifiedItem;
  updateItem: (id: string, updates: Partial<UnifiedItem>) => boolean;
  deleteItem: (id: string) => boolean;
  getItem: (id: string) => UnifiedItem | undefined;
  getItemsByTag: (tag: UnifiedItem['tag']) => UnifiedItem[];
  clearAllItems: () => void;
}

const UnifiedItemsContext = createContext<UnifiedItemsContextType | undefined>(undefined);

// Load items from localStorage
const getStoredItems = (): UnifiedItem[] => {
  try {
    const stored = localStorage.getItem('bitebuzz_unified_items');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load items from localStorage:', err);
  }
  
  // Start with empty array - only admin-created items
  return [];
};

// Save items to localStorage
const saveItems = (items: UnifiedItem[]) => {
  try {
    localStorage.setItem('bitebuzz_unified_items', JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to localStorage:', err);
  }
};

export const UnifiedItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<UnifiedItem[]>(getStoredItems());

  // Load items from localStorage on mount
  useEffect(() => {
    console.log('📦 Loading unified items from localStorage...');
    const storedItems = getStoredItems();
    console.log('🍽️ Loaded items:', storedItems.length);
    setItems(storedItems);
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (items.length > 0) {
      saveItems(items);
      console.log('💾 Saved items to localStorage:', items.length);
    }
  }, [items]);

  const addItem = useCallback((item: Omit<UnifiedItem, 'id' | 'createdAt' | 'updatedAt'>): UnifiedItem => {
    const newItem: UnifiedItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    saveItems(updatedItems);
    return newItem;
  }, [items]);

  const updateItem = useCallback((id: string, updates: Partial<UnifiedItem>): boolean => {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return false;

    const updatedItem = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    const updatedItems = [...items];
    updatedItems[index] = updatedItem;
    setItems(updatedItems);
    saveItems(updatedItems);
    return true;
  }, [items]);

  const deleteItem = useCallback((id: string): boolean => {
    const updatedItems = items.filter(item => item.id !== id);
    if (updatedItems.length === items.length) return false;

    setItems(updatedItems);
    saveItems(updatedItems);
    return true;
  }, [items]);

  const getItem = useCallback((id: string): UnifiedItem | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  const getItemsByTag = useCallback((tag: UnifiedItem['tag']): UnifiedItem[] => {
    return items.filter(item => item.tag === tag);
  }, [items]);

  const clearAllItems = useCallback(() => {
    setItems([]);
    saveItems([]);
  }, []);

  return (
    <UnifiedItemsContext.Provider
      value={{ items, addItem, updateItem, deleteItem, getItem, getItemsByTag, clearAllItems }}
    >
      {children}
    </UnifiedItemsContext.Provider>
  );
};

// Hook to use the unified items context
export const useUnifiedItems = () => {
  const context = useContext(UnifiedItemsContext);
  if (context === undefined) {
    throw new Error('useUnifiedItems must be used within a UnifiedItemsProvider');
  }
  return context;
};
