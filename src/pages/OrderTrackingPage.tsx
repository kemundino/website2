import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomerOrders } from '@/hooks/useRealtimeOrders'
import { useAuth } from '@/context/AuthContextFirebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, Package, Truck, ChefHat, Home, ArrowLeft, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import ReviewForm from '@/components/ReviewForm'

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { orders, confirmDelivery } = useCustomerOrders(user?.name)
  const [loading, setLoading] = useState(true)

  const order = orders.find(o => o.id === orderId)

  useEffect(() => {
    if (orders.length > 0) {
      setLoading(false)
    }
  }, [orders])

  const getTrackingSteps = (status: string) => {
    const steps = [
      {
        id: 'pending',
        name: 'Order Placed',
        icon: <Package className="h-5 w-5" />,
        completed: true,
        time: '2:30 PM',
        description: 'Order received and confirmed'
      },
      {
        id: 'processing',
        name: 'Processing',
        icon: <ChefHat className="h-5 w-5" />,
        completed: !['pending'].includes(status),
        time: !['pending'].includes(status) ? '2:35 PM' : undefined,
        description: 'Restaurant is preparing your food'
      },
      {
        id: 'on_the_way',
        name: 'Out for Delivery',
        icon: <Truck className="h-5 w-5" />,
        completed: status === 'delivered',
        time: status === 'delivered' ? '3:00 PM' : undefined,
        description: 'Driver is on the way'
      },
      {
        id: 'delivered',
        name: 'Delivered',
        icon: <Home className="h-5 w-5" />,
        completed: status === 'delivered',
        time: status === 'delivered' ? '3:15 PM' : undefined,
        description: order?.customerConfirmed ? 'Order delivered and confirmed' : 'Waiting for confirmation'
      }
    ]
    
    return steps
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'on_the_way': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Pending'
      case 'processing': return 'Processing Your Food'
      case 'on_the_way': return 'On the Way'
      case 'delivered': return 'Delivered Successfully'
      default: return status
    }
  }

  const handleConfirmDelivery = async () => {
    if (order && order.status === 'on_the_way') {
      const success = await confirmDelivery(order.id)
      if (success) {
        toast.success('Thank you! Delivery confirmed.')
      } else {
        toast.error('Failed to confirm delivery')
      }
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    )
  }

  const trackingSteps = getTrackingSteps(order.status)
  const currentStepIndex = trackingSteps.findIndex(step => !step.completed) + 1
  const progressPercentage = (currentStepIndex / trackingSteps.length) * 100

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
            <p className="text-muted-foreground">Track your order in real-time</p>
          </div>
          <Badge className={`text-sm px-4 py-2 ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tracking Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Order Progress</span>
                  <span>{currentStepIndex}/{trackingSteps.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              {/* Timeline Steps */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {trackingSteps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start space-x-4 p-4 rounded-lg transition-all ${
                        step.completed 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${
                            step.completed ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {step.name}
                          </h4>
                          {step.time && (
                            <span className="text-sm text-muted-foreground">{step.time}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Estimated Delivery */}
              {order.status !== 'delivered' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Truck className="h-5 w-5" />
                      <span className="font-medium">
                        Estimated delivery: {new Date(Date.now() + 30 * 60000).toLocaleTimeString()}
                      </span>
                    </div>
                    {order.status === 'on_the_way' && (
                      <Button 
                        onClick={handleConfirmDelivery}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Delivery
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Confirmation Status */}
              {order.status === 'delivered' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">
                        {order.customerConfirmed ? 'Delivery confirmed by customer' : 'Order marked as delivered'}
                      </span>
                    </div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <ReviewForm 
                      orderId={order.id} 
                      customerName={user?.name || 'Customer'} 
                    />
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Time</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.status === 'delivered' && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-800 mb-2">Order Delivered!</h3>
                <p className="text-green-700 mb-4">Thank you for your order. Enjoy your meal!</p>
                <Button onClick={() => navigate('/')}>Order Again</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderTrackingPage
