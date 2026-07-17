import { useState } from 'react'
import { useUnifiedItems, UnifiedItem } from '@/context/UnifiedItemsContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Package, ArrowUpCircle, ArrowDownCircle, Search, RefreshCcw, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const InventoryManagement = () => {
  const { items, updateItem } = useUnifiedItems()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  const filteredInventory = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdateStock = (id: string, newStock: number) => {
    const success = updateItem(id, { stock: newStock })
    if (success) {
      toast.success('Stock updated successfully')
      setEditingId(null)
    }
  }

  const isLowStock = (stock: number) => stock <= 20 && stock > 0
  const isOutOfStock = (stock: number) => stock === 0

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'regular':
        return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">📋 Regular</Badge>
      case 'custom':
        return <Badge className="bg-purple-500 text-white">⭐ Custom</Badge>
      case 'special':
        return <Badge className="bg-orange-500 text-white">🔥 Special</Badge>
      default:
        return null
    }
  }

  const lowStockItems = items.filter(item => isLowStock(item.stock || 0) || isOutOfStock(item.stock || 0))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50 shadow-sm rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <AlertCircle size={80} />
          </div>
          <CardContent className="pt-8">
            <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Action Required</p>
            <h3 className="text-4xl font-black text-rose-900 dark:text-rose-200 mt-2">{lowStockItems.length}</h3>
            <p className="text-sm font-bold text-rose-800/60 dark:text-rose-300/60 mt-1">Low stock alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 shadow-sm rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Package size={80} />
          </div>
          <CardContent className="pt-8">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Inventory Size</p>
            <h3 className="text-4xl font-black text-blue-900 dark:text-blue-200 mt-2">{items.length}</h3>
            <p className="text-sm font-bold text-blue-800/60 dark:text-blue-300/60 mt-1">Unique creations</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 shadow-sm rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <RefreshCcw size={80} />
          </div>
          <CardContent className="pt-8">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Supply Level</p>
            <h3 className="text-4xl font-black text-emerald-900 dark:text-emerald-200 mt-2">
              {items.reduce((sum, item) => sum + (item.stock || 0), 0)}
            </h3>
            <p className="text-sm font-bold text-emerald-800/60 dark:text-emerald-300/60 mt-1">Total portions available</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/20 rounded-[3rem] overflow-hidden bg-card">
        <CardHeader className="p-8 sm:p-12 bg-muted/40 border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-black text-foreground tracking-tight">Stock Control Matrix</CardTitle>
              <CardDescription className="text-muted-foreground font-bold mt-1">Monitor and calibrate supply levels across your menu</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Find a creation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-12 pr-6 rounded-2xl bg-white border-slate-200 focus:border-primary/20 focus:ring-0 font-bold text-slate-900 shadow-sm transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Creation</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Classification</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Supply Level</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-right px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Calibration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
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
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                               <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <p className="font-black text-foreground leading-none">{item.name}</p>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1">{item.category}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        {getTagBadge(item.tag)}
                      </td>
                      <td className="px-8 py-6">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                              className="w-24 h-10 rounded-lg border-primary/20 font-black"
                            />
                            <Button size="icon" variant="ghost" className="h-10 w-10 p-0 rounded-lg" onClick={() => setEditingId(null)}>
                               <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-black text-foreground text-lg">{item.stock || 0} <span className="text-[10px] uppercase text-muted-foreground ml-1">{item.unit || 'portions'}</span></span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {isOutOfStock(item.stock || 0) ? (
                          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-3 py-1 rounded-lg font-black uppercase text-[10px]">Depleted</Badge>
                        ) : isLowStock(item.stock || 0) ? (
                          <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-lg font-black uppercase text-[10px]">Low Supply</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 rounded-lg font-black uppercase text-[10px]">Optimum</Badge>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {editingId === item.id ? (
                          <Button 
                            size="sm" 
                            className="h-10 px-6 rounded-xl bg-foreground hover:bg-foreground/80 text-background font-black" 
                            onClick={() => handleUpdateStock(item.id, editValue)}
                          >
                            Sync
                          </Button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button 
                              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-90"
                              onClick={() => handleUpdateStock(item.id, (item.stock || 0) + 10)}
                              title="Add 10 portions"
                            >
                              <Plus size={18} />
                            </button>
                            <button 
                              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all active:scale-90"
                              onClick={() => handleUpdateStock(item.id, Math.max(0, (item.stock || 0) - 10))}
                              title="Remove 10 portions"
                            >
                              <Trash2 size={18} />
                            </button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-10 px-4 rounded-xl font-black text-slate-400 hover:text-primary transition-all"
                              onClick={() => {
                                setEditingId(item.id)
                                setEditValue(item.stock || 0)
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
          {filteredInventory.length === 0 && (
            <div className="py-20 text-center">
               <Package className="h-12 w-12 mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold">No matching creations found in matrix</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const X = ({ size, className }: { size?: number, className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
)

export default InventoryManagement
