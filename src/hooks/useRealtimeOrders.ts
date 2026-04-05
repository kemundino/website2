import { useState, useEffect } from 'react'

interface Order {
  id: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'processing' | 'on_the_way' | 'delivered' | 'awaiting_confirmation' | 'confirmed'
  createdAt: string
  deliveryAddress: string
  customerConfirmed?: boolean
}

// Initialize orders from localStorage or use mock data
const getStoredOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem('bitebuzz_orders');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load orders from localStorage:', err);
  }
  
  // Mock data for initial setup
  return [
    {
      id: 'ORD001',
      customerName: 'John Doe',
      items: [
        { name: 'Margherita Pizza', quantity: 2, price: 14.99 },
        { name: 'Mango Smoothie', quantity: 1, price: 6.99 }
      ],
      total: 36.97,
      status: 'processing',
      createdAt: new Date().toISOString(),
      deliveryAddress: '123 Main St, Downtown',
      customerConfirmed: false
    },
    {
      id: 'ORD002',
      customerName: 'Jane Smith',
      items: [
        { name: 'Classic Smash Burger', quantity: 1, price: 12.99 }
      ],
      total: 12.99,
      status: 'on_the_way',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      deliveryAddress: '456 Oak Ave, Uptown',
      customerConfirmed: false
    },
    {
      id: 'ORD003',
      customerName: 'Admin User',
      items: [
        { name: 'Tomato Basil Soup', quantity: 1, price: 8.99 },
        { name: 'Garden Fresh Salad', quantity: 1, price: 9.99 }
      ],
      total: 18.98,
      status: 'delivered',
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
      deliveryAddress: '789 Pine St, Midtown',
      customerConfirmed: false
    },
    {
      id: 'ORD004',
      customerName: 'Test User',
      items: [
        { name: 'Custom Pasta', quantity: 2, price: 15.99 }
      ],
      total: 31.98,
      status: 'pending',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      deliveryAddress: '321 Elm St, Riverside',
      customerConfirmed: false
    }
  ];
};

const saveOrders = (orders: Order[]) => {
  try {
    localStorage.setItem('bitebuzz_orders', JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders to localStorage:', err);
  }
};

// Mock database - in real app, this would be WebSocket/Server-Sent Events
let mockOrders: Order[] = getStoredOrders();

// Simulate real-time updates
const orderSubscribers = new Set<(orders: Order[]) => void>()

const notifySubscribers = () => {
  orderSubscribers.forEach(callback => callback([...mockOrders]))
}

export const useRealtimeOrders = () => {
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders())

  useEffect(() => {
    // Load fresh orders from localStorage on mount
    const freshOrders = getStoredOrders();
    mockOrders = freshOrders;
    setOrders([...freshOrders]);

    const subscriber = (updatedOrders: Order[]) => {
      setOrders(updatedOrders)
    }

    orderSubscribers.add(subscriber)

    return () => {
      orderSubscribers.delete(subscriber)
    }
  }, [])

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    console.log('🛒 Adding new order to real-time system:', orderData)
    
    const newOrder: Order = {
      ...orderData,
      id: `ORD${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    mockOrders.unshift(newOrder) // Add to beginning
    saveOrders(mockOrders); // Persist to localStorage
    notifySubscribers()
    
    console.log('✅ Order added successfully. Total orders:', mockOrders.length)
    console.log('📦 Current orders:', mockOrders)
    
    return newOrder
  }

  const updateStatus = (orderId: string, newStatus: Order['status']) => {
    console.log('🔄 Updating order status:', orderId, 'to', newStatus)
    
    const orderIndex = mockOrders.findIndex(order => order.id === orderId)
    if (orderIndex === -1) {
      console.error('❌ Order not found:', orderId)
      return false
    }

    mockOrders[orderIndex].status = newStatus
    saveOrders(mockOrders); // Persist to localStorage
    notifySubscribers()
    
    console.log('✅ Status updated successfully')
    return true
  }

  const confirmDelivery = (orderId: string) => {
    const orderIndex = mockOrders.findIndex(order => order.id === orderId)
    if (orderIndex === -1) return false

    mockOrders[orderIndex].customerConfirmed = true
    // Change status to delivered when customer confirms
    if (mockOrders[orderIndex].status === 'awaiting_confirmation') {
      mockOrders[orderIndex].status = 'delivered'
    }
    saveOrders(mockOrders); // Persist to localStorage
    notifySubscribers()
    
    return true
  }

  return {
    orders,
    addOrder,
    updateStatus,
    confirmDelivery
  }
}

// Hook for admin users
export const useAdminOrders = () => {
  const { orders, updateStatus, confirmDelivery } = useRealtimeOrders()

  return {
    orders,
    updateStatus,
    confirmDelivery
  }
}

// Customer-specific hook for order tracking
export const useCustomerOrders = (customerName?: string) => {
  const { orders, confirmDelivery } = useRealtimeOrders()

  const customerOrders = customerName 
    ? orders.filter(order => order.customerName === customerName)
    : orders

  const confirmOrderDelivery = (orderId: string) => {
    const success = confirmDelivery(orderId)
    if (success) {
      console.log(`Customer confirmed delivery for order ${orderId}`)
    }
    return success
  }

  return {
    orders: customerOrders,
    confirmDelivery: confirmOrderDelivery
  }
}
