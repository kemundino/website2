import { useState } from 'react'
import { useUnifiedItems } from '@/context/UnifiedItemsContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Package, ArrowUpCircle, ArrowDownCircle, Search, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface InventoryItem {
  id: string
  name: string
  category: string
  stock: number
  minStock: number
  lastUpdated: string
  tag: 'regular' | 'custom' | 'special'
}

const InventoryManagement = () => {
  const { items } = useUnifiedItems()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  // Convert unified items to inventory format
  const inventory: InventoryItem[] = items.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category || 'Uncategorized',
    stock: Math.floor(Math.random() * 100) + 10, // Random stock for demo
    minStock: 20,
    lastUpdated: new Date().toISOString(),
    tag: item.tag
  }))

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdateStock = (id: string) => {
    // In a real app, this would update the inventory in the database
    // For now, we'll just show a success message
    toast.success('Stock updated successfully')
    setEditingId(null)
  }

  const isLowStock = (stock: number, minStock: number) => stock <= minStock && stock > 0
  const isOutOfStock = (stock: number) => stock === 0

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'regular':
        return <Badge variant="secondary">📋 Regular</Badge>
      case 'custom':
        return <Badge className="bg-purple-500 text-white">⭐ Custom</Badge>
      case 'special':
        return <Badge className="bg-orange-500 text-white">🔥 Special</Badge>
      default:
        return null
    }
  }

  const lowStockItems = inventory.filter(isLowStock)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Low Stock Alert</p>
                <h3 className="text-2xl font-bold text-orange-900 mt-1">{lowStockItems.length} Items</h3>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Items</p>
                <h3 className="text-2xl font-bold text-blue-900 mt-1">{inventory.length}</h3>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">In Stock Portions</p>
                <h3 className="text-2xl font-bold text-green-900 mt-1">
                  {inventory.reduce((sum, item) => sum + item.stock, 0)}
                </h3>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <RefreshCcw className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Inventory List</CardTitle>
              <CardDescription>Manage your stock levels for all menu items</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-semibold text-muted-foreground">Item Name</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground">Category</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground">Stock</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground">Status</th>
                  <th className="text-right pb-3 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <AnimatePresence mode="popLayout">
                  {filteredInventory.map((item) => (
                    <motion.tr 
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 font-medium">{item.name}</td>
                      <td className="py-4 text-muted-foreground capitalize">{item.category}</td>
                      <td className="py-4">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                              className="w-20 h-8"
                            />
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}>✕</Button>
                          </div>
                        ) : (
                          <span className="font-semibold">{item.stock} {item.unit}</span>
                        )}
                      </td>
                      <td className="py-4">
                        {isOutOfStock(item) ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Out of Stock</Badge>
                        ) : isLowStock(item) ? (
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Normal</Badge>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {editingId === item.id ? (
                          <Button 
                            size="sm" 
                            className="h-8" 
                            onClick={() => handleUpdateStock(item.id)}
                          >
                            Save
                          </Button>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-blue-600"
                              onClick={() => {
                                updateStock(item.id, item.stock + 10)
                                toast.success('Added 10 units')
                              }}
                            >
                              <ArrowUpCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-orange-600"
                              onClick={() => {
                                updateStock(item.id, item.stock - 5)
                                toast.info('Removed 5 units')
                              }}
                            >
                              <ArrowDownCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingId(item.id)
                                setEditValue(item.stock)
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InventoryManagement
