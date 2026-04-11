/**
 * Menu items are loaded from Firestore (`menu` collection) so they appear on every device.
 * The implementation lives in UnifiedItemsContextFirebase.tsx.
 */
export { UnifiedItemsProvider, useUnifiedItems } from './UnifiedItemsContextFirebase';
export type { UnifiedItem } from './UnifiedItemsContextFirebase';
