import { useCustomItems } from '@/context/CustomItemsContext';
import { MenuItem } from '@/data/menu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomMenuItemsProps {
  search?: string;
  category?: string;
}

const CustomMenuItems = ({ search = '', category = 'all' }: CustomMenuItemsProps) => {
  const { customItems } = useCustomItems();
  const { addItem, items: cart } = useCart();

  // Filter custom items based on search and category
  const filteredItems = customItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'all' || 
                           item.category?.toLowerCase() === category.toLowerCase() ||
                           (category === 'Custom' && (!item.category || item.category === 'Custom'));
    return matchesSearch && matchesCategory;
  });

  if (customItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Custom Items Yet</h3>
        <p className="text-sm text-muted-foreground">
          Admin can add custom items through the admin panel
        </p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No custom items found matching your criteria.</p>
      </div>
    );
  }

  const handleAddToCart = (item: any) => {
    const menuItem: MenuItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description || '',
      category: item.category || 'Custom',
      image: item.image || '/api/placeholder/300/200',
      rating: 0,
      prepTime: '15-20 min',
    };
    addItem(menuItem);
  };

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500" />
        <h2 className="font-display text-2xl font-bold text-foreground">Custom Items</h2>
        <Badge variant="secondary">{filteredItems.length}</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const isInCart = cart.some((cartItem: any) => cartItem.id === item.id);
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-0">
                    {/* Custom Badge */}
                    <Badge className="absolute top-2 left-2 bg-purple-500 text-white z-10">
                      ⭐ Custom
                    </Badge>
                    
                    <div className="relative">
                      <img 
                        src={item.image || '/api/placeholder/300/200'} 
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="text-white font-bold">{item.name}</h3>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">New</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          15-20 min
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
                          {item.category && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={isInCart}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {isInCart ? 'In Cart' : 'Add to Cart'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomMenuItems;
