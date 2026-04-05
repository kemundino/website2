import { useState } from 'react';
import { useUnifiedItems } from '@/context/UnifiedItemsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Save, X, DollarSign, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const CustomItemManager = () => {
  const { items, addItem, updateItem, deleteItem } = useUnifiedItems();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filter only custom items
  const customItems = items.filter(item => item.tag === 'custom');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Custom',
    image: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Custom',
      image: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      if (editingId) {
        // Update existing item
        const success = updateItem(editId, {
          name: formData.name.trim(),
          price,
          description: formData.description.trim(),
          category: formData.category,
          image: formData.image.trim() || '/api/placeholder/300/200',
        });
        
        if (success) {
          toast.success('Custom item updated successfully! ✏️');
          resetForm();
        }
      } else {
        // Add new item
        const newItem = addItem({
          name: formData.name.trim(),
          price,
          description: formData.description.trim(),
          category: formData.category,
          image: formData.image.trim() || '/api/placeholder/300/200',
          rating: 0,
          prepTime: '15-20 min',
          tag: 'custom',
        });
        
        toast.success('Custom item added successfully! 🍽️');
        resetForm();
      }
    } catch (err) {
      toast.error('Failed to save custom item');
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      category: item.category || 'Custom',
      image: item.image || '',
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteItem(id);
      if (success) {
        toast.success('Custom item deleted successfully! 🗑️');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-lg sm:text-xl">Custom Item Management</span>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              size="sm"
              className="gap-2 w-full sm:w-auto"
            >
              {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isAdding ? 'Cancel' : 'Add Custom Item'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Item Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Special Burger"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price ($) *</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                              placeholder="12.99"
                              className="pl-9"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Main Course">🍽️ Main Course</SelectItem>
                            <SelectItem value="Appetizer">🥗 Appetizer</SelectItem>
                            <SelectItem value="Dessert">🍰 Dessert</SelectItem>
                            <SelectItem value="Beverage">🥤 Beverage</SelectItem>
                            <SelectItem value="Soup">🍲 Soup</SelectItem>
                            <SelectItem value="Salad">🥬 Salad</SelectItem>
                            <SelectItem value="Pizza">🍕 Pizza</SelectItem>
                            <SelectItem value="Burger">🍔 Burger</SelectItem>
                            <SelectItem value="Pasta">🍝 Pasta</SelectItem>
                            <SelectItem value="Custom">⭐ Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="image">Image URL</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="image"
                              value={formData.image}
                              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                              placeholder="https://example.com/image.jpg"
                              className="pl-9"
                            />
                          </div>
                          {formData.image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-gray-100 flex-shrink-0">
                              <img
                                src={formData.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                style={{
                                  objectFit: 'cover',
                                  width: '100%',
                                  height: '100%'
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = '/api/placeholder/300/200';
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter an image URL or leave blank for default image
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your custom item..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button type="submit" className="gap-2 w-full sm:w-auto">
                          <Save className="h-4 w-4" />
                          {editingId ? 'Update Item' : 'Add Item'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Items List */}
          <div className="space-y-3">
            {customItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg font-medium">No custom items yet</p>
                <p className="text-sm">Add your first custom item to get started!</p>
              </div>
            ) : (
              customItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h4 className="font-semibold text-base">{item.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded w-fit">
                        {item.category || 'Custom'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{item.description}</p>
                    )}
                    <p className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="gap-1 flex-1 sm:flex-none"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Edit</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="gap-1 flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Delete</span>
                      <span className="sm:hidden">Del</span>
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomItemManager;
