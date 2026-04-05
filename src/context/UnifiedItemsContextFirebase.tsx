import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { MenuService } from '@/firebase/firestore';
import { toast } from 'sonner';

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

// Convert Firestore document to UnifiedItem
const convertFirestoreItem = (doc: any): UnifiedItem => ({
  id: doc.id,
  name: doc.name || '',
  price: doc.price || 0,
  description: doc.description || '',
  category: doc.category || '',
  image: doc.image || '',
  rating: doc.rating || 0,
  prepTime: doc.prepTime || '15-20 min',
  spicy: doc.spicy || false,
  isVeg: doc.isVeg || false,
  isBestseller: doc.isBestseller || false,
  tag: doc.tag || 'regular',
  createdAt: doc.createdAt?.toDate?.()?.toISOString() || doc.createdAt || new Date().toISOString(),
  updatedAt: doc.updatedAt?.toDate?.()?.toISOString() || doc.updatedAt || new Date().toISOString()
});

export const UnifiedItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<UnifiedItem[]>([]);

  // Load items from Firebase on mount
  useEffect(() => {
    console.log('🍽️ Loading menu items from Firebase...');
    
    const unsubscribe = MenuService.subscribe((menuData) => {
      const convertedItems: UnifiedItem[] = menuData.map(convertFirestoreItem);
      setItems(convertedItems);
      console.log(`🍽️ Loaded ${convertedItems.length} menu items`);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addItem = useCallback((itemData: Omit<UnifiedItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('➕ Adding new menu item:', itemData.name);
    
    const newItem = {
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to Firebase
    MenuService.create(newItem).then(result => {
      if (result.success) {
        console.log('✅ Menu item added successfully');
        toast.success('Menu item added successfully!');
      } else {
        console.error('❌ Failed to add menu item:', result.error);
        toast.error('Failed to add menu item');
      }
    });

    // Return optimistic update
    const optimisticItem: UnifiedItem = {
      ...itemData,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return optimisticItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<UnifiedItem>): boolean => {
    console.log('🔄 Updating menu item:', id);
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Update in Firebase
    MenuService.update(id, updateData).then(result => {
      if (result.success) {
        console.log('✅ Menu item updated successfully');
        toast.success('Menu item updated successfully!');
      } else {
        console.error('❌ Failed to update menu item:', result.error);
        toast.error('Failed to update menu item');
      }
    });

    // Optimistic update
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    ));

    return true;
  }, []);

  const deleteItem = useCallback((id: string): boolean => {
    console.log('🗑️ Deleting menu item:', id);
    
    // Delete from Firebase
    MenuService.delete(id).then(result => {
      if (result.success) {
        console.log('✅ Menu item deleted successfully');
        toast.success('Menu item deleted successfully!');
      } else {
        console.error('❌ Failed to delete menu item:', result.error);
        toast.error('Failed to delete menu item');
      }
    });

    // Optimistic update
    setItems(prev => prev.filter(item => item.id !== id));
    return true;
  }, []);

  const getItem = useCallback((id: string): UnifiedItem | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  const getItemsByTag = useCallback((tag: UnifiedItem['tag']): UnifiedItem[] => {
    return items.filter(item => item.tag === tag);
  }, [items]);

  const clearAllItems = useCallback(() => {
    console.warn('⚠️ Clearing all menu items - this will delete from Firebase');
    
    // Delete all items from Firebase
    items.forEach(item => {
      MenuService.delete(item.id);
    });
    
    setItems([]);
    toast.success('All menu items cleared');
  }, [items]);

  const value: UnifiedItemsContextType = {
    items,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    getItemsByTag,
    clearAllItems
  };

  return (
    <UnifiedItemsContext.Provider value={value}>
      {children}
    </UnifiedItemsContext.Provider>
  );
};

export const useUnifiedItems = () => {
  const context = useContext(UnifiedItemsContext);
  if (!context) {
    throw new Error('useUnifiedItems must be used within UnifiedItemsProvider');
  }
  return context;
};

export default UnifiedItemsProvider;
