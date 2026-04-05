import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Package, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface OrderStep {
  id: string
  name: string
  icon: React.ReactNode
  completed: boolean
  time?: string
}

interface OrderTrackingProps {
  orderId: string
}

const OrderTracking = ({ orderId }: OrderTrackingProps) => {
  const [steps, setSteps] = useState<OrderStep[]>([
    {
      id: '1',
      name: 'Order Placed',
      icon: <Package className="h-4 w-4" />,
      completed: true,
      time: '2:30 PM'
    },
    {
      id: '2',
      name: 'Preparing',
      icon: <Clock className="h-4 w-4" />,
      completed: true,
      time: '2:35 PM'
    },
    {
      id: '3',
      name: 'Out for Delivery',
      icon: <Truck className="h-4 w-4" />,
      completed: false
    },
    {
      id: '4',
      name: 'Delivered',
      icon: <CheckCircle className="h-4 w-4" />,
      completed: false
    }
  ])

  const currentStep = steps.findIndex(step => !step.completed) + 1
  const progressPercentage = (currentStep / steps.length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Order #{orderId}
          <Badge variant="secondary">In Progress</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Order Progress</span>
            <span>{currentStep}/{steps.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${
                step.completed 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-full ${
                step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    step.completed ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {step.name}
                  </h4>
                  {step.time && (
                    <span className="text-sm text-muted-foreground">{step.time}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <Truck className="h-5 w-5" />
            <span className="font-medium">Estimated delivery: 3:15 PM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderTracking
