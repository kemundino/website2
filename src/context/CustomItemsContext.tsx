import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface CustomItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
  isCustom: true;
  createdAt: string;
  updatedAt: string;
}

interface CustomItemsContextType {
  customItems: CustomItem[];
  addCustomItem: (item: Omit<CustomItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => CustomItem;
  updateCustomItem: (id: string, updates: Partial<CustomItem>) => boolean;
  deleteCustomItem: (id: string) => boolean;
  getCustomItem: (id: string) => CustomItem | undefined;
  clearAllCustomItems: () => void;
}

const CustomItemsContext = createContext<CustomItemsContextType | undefined>(undefined);

// Load custom items from localStorage
const getStoredCustomItems = (): CustomItem[] => {
  try {
    const stored = localStorage.getItem('bitebuzz_custom_items');
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to load custom items from localStorage:', err);
    return [];
  }
};

// Save custom items to localStorage
const saveCustomItems = (items: CustomItem[]) => {
  try {
    localStorage.setItem('bitebuzz_custom_items', JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save custom items to localStorage:', err);
  }
};

export const CustomItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);

  // Load custom items from localStorage on mount
  useEffect(() => {
    console.log('📝 Loading custom items from localStorage...');
    const storedItems = getStoredCustomItems();
    console.log('🍽️ Loaded custom items:', storedItems.length);
    setCustomItems(storedItems);
  }, []);

  // Save custom items to localStorage whenever they change
  useEffect(() => {
    if (customItems.length > 0) {
      saveCustomItems(customItems);
      console.log('💾 Saved custom items to localStorage:', customItems.length);
    }
  }, [customItems]);

  const addCustomItem = useCallback((itemData: Omit<CustomItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: CustomItem = {
      ...itemData,
      id: `CUSTOM_${Date.now()}`,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    setCustomItems(prev => {
      const updated = [...prev, newItem];
      console.log('➕ Added custom item:', newItem.name);
      return updated;
    });

    return newItem;
  }, []);

  const updateCustomItem = useCallback((id: string, updates: Partial<CustomItem>) => {
    let success = false;
    
    setCustomItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) {
        console.error('❌ Custom item not found:', id);
        return prev;
      }

      const updated = prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      );

      console.log('✏️ Updated custom item:', id);
      success = true;
      return updated;
    });

    return success;
  }, []);

  const deleteCustomItem = useCallback((id: string) => {
    let success = false;
    
    setCustomItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      if (filtered.length === prev.length) {
        console.error('❌ Custom item not found for deletion:', id);
        return prev;
      }

      console.log('🗑️ Deleted custom item:', id);
      success = true;
      return filtered;
    });

    if (success) {
      // Also clear from localStorage if empty
      if (customItems.length <= 1) {
        try {
          localStorage.removeItem('bitebuzz_custom_items');
        } catch (err) {
          console.error('Failed to clear custom items from localStorage:', err);
        }
      }
    }

    return success;
  }, [customItems.length]);

  const getCustomItem = useCallback((id: string) => {
    return customItems.find(item => item.id === id);
  }, [customItems]);

  const clearAllCustomItems = useCallback(() => {
    console.log('🧹 Clearing all custom items');
    setCustomItems([]);
    try {
      localStorage.removeItem('bitebuzz_custom_items');
    } catch (err) {
      console.error('Failed to clear custom items from localStorage:', err);
    }
  }, []);

  return (
    <CustomItemsContext.Provider value={{
      customItems,
      addCustomItem,
      updateCustomItem,
      deleteCustomItem,
      getCustomItem,
      clearAllCustomItems,
    }}>
      {children}
    </CustomItemsContext.Provider>
  );
};

export const useCustomItems = () => {
  const ctx = useContext(CustomItemsContext);
  if (!ctx) throw new Error('useCustomItems must be used within CustomItemsProvider');
  return ctx;
};
