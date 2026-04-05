import { useUnifiedItems } from '@/context/UnifiedItemsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface UnifiedMenuProps {
  search?: string;
  category?: string;
  tag?: 'all' | 'regular' | 'custom' | 'special';
}

const UnifiedMenu = ({ search = '', category = 'all', tag = 'all' }: UnifiedMenuProps) => {
  const { items } = useUnifiedItems();
  const { addItem, items: cart } = useCart();

  // Filter items based on search, category, and tag
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'all' || 
                           item.category?.toLowerCase() === category.toLowerCase();
    const matchesTag = tag === 'all' || item.tag === tag;
    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleAddToCart = (item: any) => {
    addItem(item);
  };

  const getTagBadge = (itemTag: string) => {
    switch (itemTag) {
      case 'regular':
        return <Badge variant="secondary">📋 Regular</Badge>;
      case 'custom':
        return <Badge className="bg-purple-500 text-white">⭐ Custom</Badge>;
      case 'special':
        return <Badge className="bg-orange-500 text-white">🔥 Special</Badge>;
      default:
        return null;
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Items Yet</h3>
        <p className="text-sm text-muted-foreground">
          Admin can add items through the admin panel
        </p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No items found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden rounded-lg shadow-md">
            <CardContent className="p-0">
              <div className="relative h-32 w-full">
                <img
                  src={item.image || '/api/placeholder/300/200'}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/300/200';
                  }}
                />
                {item.isBestseller && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    ⭐ Bestseller
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground sm:text-base">{item.name}</h3>
                  <span className="text-xs font-bold text-primary sm:text-sm">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {item.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {getTagBadge(item.tag)}
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                    className="ml-auto"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UnifiedMenu;
