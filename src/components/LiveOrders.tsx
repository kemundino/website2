import { useAdminOrders } from '@/hooks/useRealtimeOrders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as Icons from 'lucide-react'
import { toast } from 'sonner'

const LiveOrders = () => {
  const { orders = [], updateStatus } = useAdminOrders()
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'on_the_way': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'awaiting_confirmation': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Icons.Clock className="h-4 w-4" />
      case 'processing': return <Icons.ChefHat className="h-4 w-4" />
      case 'on_the_way': return <Icons.Truck className="h-4 w-4" />
      case 'delivered': return <Icons.CheckCircle className="h-4 w-4" />
      case 'awaiting_confirmation': return <Icons.Users className="h-4 w-4" />
      default: return <Icons.Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'processing': return 'Processing'
      case 'on_the_way': return 'On the way'
      case 'delivered': return 'Delivered'
      case 'awaiting_confirmation': return 'Awaiting Confirmation'
      default: return status
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const success = await updateStatus(orderId, newStatus as any)
    if (success) {
      toast.success(`Order updated to ${getStatusText(newStatus)}`)
    } else {
      toast.error('Failed to update status')
    }
  }

  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow = ['pending', 'processing', 'on_the_way', 'awaiting_confirmation', 'delivered']
    const currentIndex = statusFlow.indexOf(currentStatus)
    return statusFlow.slice(currentIndex + 1)
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const activeOrders = orders.filter(order => order.status !== 'delivered').length

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-blue-100 rounded-xl mr-4">
              <Icons.Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{activeOrders}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Orders</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-emerald-100 rounded-xl mr-4">
              <Icons.DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">${totalRevenue.toFixed(2)}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-purple-100 rounded-xl mr-4">
              <Icons.Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{orders.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Logs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/30 rounded-[2rem] border-2 border-dashed border-slate-100">
              <Icons.Package className="h-16 w-16 mx-auto mb-4 text-slate-200" />
              <p className="text-xl font-black text-slate-400">Awaiting Orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                        #{order.id.slice(0, 4).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg">{order.customerName}</p>
                        <Badge className={`mt-1 border-none ${getStatusColor(order.status)}`}>
                          <div className="flex items-center gap-1.5 py-0.5 font-black text-[9px] uppercase tracking-wider">
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </div>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-black text-slate-900">${(order.total || 0).toFixed(2)}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Processed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ordered Items</p>
                    <div className="bg-slate-50/50 rounded-2xl p-4 space-y-2">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-slate-900 shadow-sm border border-slate-100">
                                {item.quantity}x
                              </span>
                              <span className="font-bold text-slate-700">{item.name}</span>
                            </div>
                            <span className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No items listed</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 mt-6 border-t border-slate-50">
                    <div className="flex items-start gap-3 max-w-sm">
                      <Icons.MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Logistics Route</p>
                        <p className="text-sm font-bold text-slate-700">{order.deliveryAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                        disabled={order.status === 'delivered'}
                      >
                        <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700 shadow-sm">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                          {getNextStatusOptions(order.status).map(status => (
                            <SelectItem key={status} value={status} className="rounded-xl my-1">
                              <div className="flex items-center gap-2 font-bold text-slate-600">
                                {getStatusIcon(status)}
                                {getStatusText(status)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
}

export default LiveOrders
