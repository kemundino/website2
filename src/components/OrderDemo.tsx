import { useState } from 'react'
import { useAdminOrders } from '@/hooks/useRealtimeOrders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, ChefHat, Truck, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const OrderDemo = () => {
  const { orders, updateStatus } = useAdminOrders()
  const [currentDemo, setCurrentDemo] = useState(0)

  const demoSteps = [
    {
      title: "Step 1: Customer Places Order",
      description: "Order appears in admin panel as 'Pending'",
      action: () => {
        // Demo order is already created
        setCurrentDemo(1)
        toast.info("Order placed! Check admin panel.")
      }
    },
    {
      title: "Step 2: Admin Updates Status",
      description: "Admin changes order to 'Processing'",
      action: () => {
        const pendingOrder = orders.find(o => o.status === 'pending')
        if (pendingOrder) {
          void updateStatus(pendingOrder.id, 'processing').then((ok) => {
            if (ok) {
              setCurrentDemo(2)
              toast.success("Order status updated to Processing")
            }
          })
        }
      }
    },
    {
      title: "Step 3: Order Ready for Delivery",
      description: "Admin marks order as 'On the Way'",
      action: () => {
        const processingOrder = orders.find(o => o.status === 'processing')
        if (processingOrder) {
          void updateStatus(processingOrder.id, 'on_the_way').then((ok) => {
            if (ok) {
              setCurrentDemo(3)
              toast.success("Order is now on the way!")
            }
          })
        }
      }
    },
    {
      title: "Step 4: Customer Confirms Delivery",
      description: "Customer clicks 'Confirm Delivery' button",
      action: () => {
        const onWayOrder = orders.find(o => o.status === 'on_the_way')
        if (onWayOrder) {
          // In real app, customer would confirm
          setCurrentDemo(4)
          toast.info("Customer would confirm delivery now")
        }
      }
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Users className="h-4 w-4" />
      case 'processing': return <ChefHat className="h-4 w-4" />
      case 'on_the_way': return <Truck className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'on_the_way': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>🚀 Live Order Management Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Order Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Current Orders:</h4>
            <div className="space-y-2">
              {orders.slice(0, 2).map(order => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded border gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">#{order.id}</span>
                    <Badge className={`${getStatusColor(order.status)} text-xs`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span className="hidden sm:inline">{order.status}</span>
                        <span className="sm:hidden">{order.status.slice(0, 4)}</span>
                      </div>
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{order.customerName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Steps */}
          <div className="space-y-3">
            <h4 className="font-semibold">Try the workflow:</h4>
            {demoSteps.map((step, index) => (
              <div 
                key={index}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border gap-3 ${
                  index === currentDemo ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
              >
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{step.title}</h5>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <Button 
                  onClick={step.action}
                  disabled={index > currentDemo}
                  size="sm"
                  variant={index === currentDemo ? "default" : "outline"}
                  className="w-full sm:w-auto"
                >
                  {index === currentDemo ? "Try Now" : "Locked"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📋 How it works:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Admin sees orders in real-time in admin panel</li>
              <li>Admin updates order status using dropdown</li>
              <li>Customer sees live status updates on tracking page</li>
              <li>Customer confirms delivery when order arrives</li>
              <li>Status syncs across all users instantly</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderDemo
