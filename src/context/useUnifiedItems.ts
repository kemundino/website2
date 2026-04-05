import { useContext } from 'react';
import { UnifiedItemsContext } from './UnifiedItemsContext';

export const useUnifiedItems = () => {
  const context = useContext(UnifiedItemsContext);
  if (!context) {
    throw new Error('useUnifiedItems must be used within a UnifiedItemsProvider');
  }
  return context;
};