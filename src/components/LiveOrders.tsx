import { useAdminOrders } from '@/hooks/useRealtimeOrders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Users, DollarSign, TrendingUp, Package, Truck, CheckCircle, ChefHat } from 'lucide-react'
import { toast } from 'sonner'

const LiveOrders = () => {
  console.log('🔥 LiveOrders component is rendering!')
  
  try {
    const { orders, updateStatus } = useAdminOrders()
    
    console.log('📦 Orders from hook:', orders)
    console.log('📊 Orders length:', orders?.length)

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        case 'processing': return 'bg-blue-100 text-blue-800'
        case 'on_the_way': return 'bg-orange-100 text-orange-800'
        case 'confirmed': return 'bg-purple-100 text-purple-800'
        case 'delivered': return 'bg-green-100 text-green-800'
        case 'awaiting_confirmation': return 'bg-purple-100 text-purple-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pending': return <Clock className="h-4 w-4" />
        case 'processing': return <ChefHat className="h-4 w-4" />
        case 'on_the_way': return <Truck className="h-4 w-4" />
        case 'confirmed': return <Package className="h-4 w-4" />
        case 'delivered': return <CheckCircle className="h-4 w-4" />
        case 'awaiting_confirmation': return <Users className="h-4 w-4" />
        default: return <Clock className="h-4 w-4" />
      }
    }

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending': return 'Pending'
        case 'processing': return 'Processing'
        case 'on_the_way': return 'On the way'
        case 'confirmed': return 'Confirmed'
        case 'delivered': return 'Delivered'
        case 'awaiting_confirmation': return 'Awaiting Confirmation'
        default: return status
      }
    }

    const handleStatusChange = async (orderId: string, newStatus: string) => {
      console.log('🔄 Changing status:', orderId, 'to', newStatus)
      const success = await updateStatus(orderId, newStatus as any)
      if (success) {
        toast.success(`Order ${orderId} updated to ${getStatusText(newStatus)}`)
      } else {
        toast.error('Failed to update order status')
      }
    }

    const getNextStatusOptions = (currentStatus: string) => {
      const statusFlow = ['pending', 'processing', 'on_the_way', 'confirmed', 'awaiting_confirmation', 'delivered']
      const currentIndex = statusFlow.indexOf(currentStatus)
      return statusFlow.slice(currentIndex + 1)
    }

    const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0
    const activeOrders = orders?.filter(order => order.status !== 'delivered').length || 0

    return (
      <div className="space-y-6">
        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">🔍 Debug Info:</p>
          <p className="text-blue-700 text-sm">Orders found: {orders?.length || 0}</p>
          <p className="text-blue-700 text-sm">Active orders: {activeOrders}</p>
          <p className="text-blue-700 text-sm">Total revenue: ${totalRevenue.toFixed(2)}</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <p className="text-2xl font-bold">{activeOrders}</p>
                <p className="text-sm text-muted-foreground">Active Orders</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <DollarSign className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <p className="text-2xl font-bold">{orders?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Customer Orders Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!orders || orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No customer orders yet</p>
                <p className="text-sm">Orders will appear here when customers place them</p>
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <p>💡 To test: Place an order as a customer, then check back here!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold">${order.total.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        📍 {order.deliveryAddress}
                        {order.customerConfirmed && (
                          <span className="ml-2 text-green-600">✓ Customer confirmed delivery</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={order.status === 'delivered'}
                        >
                          <SelectTrigger className="w-32 sm:w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getNextStatusOptions(order.status).map(status => (
                              <SelectItem key={status} value={status}>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(status)}
                                  {getStatusText(status)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {order.status === 'delivered' && (
                          <Badge className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('❌ Error in LiveOrders:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">❌ Error in LiveOrders component:</p>
        <p className="text-red-700 text-sm">{error.message}</p>
        <p className="text-red-600 text-xs mt-2">Check console for more details</p>
      </div>
    )
  }
}

export default LiveOrders
