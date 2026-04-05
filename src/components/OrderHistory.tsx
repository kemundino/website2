import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Calendar, Package, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Order {
  id: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'
  createdAt: string
  deliveryAddress: string
}

const OrderHistory = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  
  // Mock data - in real app, this would come from API
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      customerName: 'John Doe',
      items: [
        { name: 'Margherita Pizza', quantity: 2, price: 14.99 },
        { name: 'Mango Smoothie', quantity: 1, price: 6.99 }
      ],
      total: 36.97,
      status: 'delivered',
      createdAt: '2024-03-20T14:30:00Z',
      deliveryAddress: '123 Main St, Downtown'
    },
    {
      id: 'ORD002',
      customerName: 'John Doe',
      items: [
        { name: 'Classic Smash Burger', quantity: 1, price: 12.99 },
        { name: 'Tiramisu', quantity: 1, price: 8.99 }
      ],
      total: 21.98,
      status: 'out_for_delivery',
      createdAt: '2024-03-22T18:15:00Z',
      deliveryAddress: '123 Main St, Downtown'
    },
    {
      id: 'ORD003',
      customerName: 'John Doe',
      items: [
        { name: 'Salmon Nigiri Set', quantity: 1, price: 22.99 }
      ],
      total: 22.99,
      status: 'preparing',
      createdAt: new Date().toISOString(),
      deliveryAddress: '123 Main St, Downtown'
    }
  ])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-purple-100 text-purple-800'
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'preparing': return 'Preparing'
      case 'ready': return 'Ready'
      case 'out_for_delivery': return 'On the Way'
      case 'delivered': return 'Delivered'
      default: return status
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(search.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    const orderDate = new Date(order.createdAt)
    const today = new Date()
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && orderDate.toDateString() === today.toDateString()) ||
                       (dateFilter === 'week' && (today.getTime() - orderDate.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'month' && (today.getTime() - orderDate.getTime()) < 30 * 24 * 60 * 60 * 1000)
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="out_for_delivery">On the Way</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders found matching your criteria.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {order.items.map((item, index) => (
                              <span key={index} className="text-muted-foreground">
                                {item.name} x{item.quantity}
                              </span>
                            ))}
                          </div>
                          <div className="font-semibold">${order.total.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {order.status !== 'delivered' && (
                          <Link to={`/track/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Track
                            </Button>
                          </Link>
                        )}
                        <Link to={`/track/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderHistory
