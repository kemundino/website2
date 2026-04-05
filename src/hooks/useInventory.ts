import { useState, useEffect } from 'react'
import { menuItems } from '@/data/menu'

export interface InventoryItem {
  id: string
  name: string
  stock: number
  minStock: number
  unit: string
  category: string
}

// Initial mock inventory based on menu items
let mockInventory: InventoryItem[] = menuItems.map(item => ({
  id: item.id,
  name: item.name,
  stock: Math.floor(Math.random() * 50) + 10,
  minStock: 10,
  unit: 'portions',
  category: item.category
}))

const inventorySubscribers = new Set<(inventory: InventoryItem[]) => void>()

const notifySubscribers = () => {
  inventorySubscribers.forEach(callback => callback([...mockInventory]))
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)

  useEffect(() => {
    const handleUpdate = (updatedInventory: InventoryItem[]) => {
      setInventory(updatedInventory)
    }
    inventorySubscribers.add(handleUpdate)
    return () => {
      inventorySubscribers.delete(handleUpdate)
    }
  }, [])

  const updateStock = (id: string, newStock: number) => {
    const index = mockInventory.findIndex(item => item.id === id)
    if (index !== -1) {
      mockInventory[index].stock = Math.max(0, newStock)
      notifySubscribers()
      return true
    }
    return false
  }

  const deductStock = (items: { name: string, quantity: number }[]) => {
    let success = true
    items.forEach(orderItem => {
      const item = mockInventory.find(i => i.name === orderItem.name)
      if (item) {
        item.stock = Math.max(0, item.stock - orderItem.quantity)
      } else {
        success = false
      }
    })
    if (success) notifySubscribers()
    return success
  }

  const isLowStock = (item: InventoryItem) => item.stock <= item.minStock
  const isOutOfStock = (item: InventoryItem) => item.stock <= 0

  return {
    inventory,
    updateStock,
    deductStock,
    isLowStock,
    isOutOfStock
  }
}
