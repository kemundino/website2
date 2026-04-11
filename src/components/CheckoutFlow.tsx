import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContextFirebase'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { useInventory } from '@/hooks/useInventory'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, CheckCircle } from 'lucide-react'

const CheckoutFlow = () => {
  const navigate = useNavigate()
  const { items: cartItems, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { addOrder } = useRealtimeOrders()
  const { deductStock } = useInventory()
  const { addLoyaltyPoints } = useCustomerProfile()
  
  console.log('CheckoutFlow mounted!')
  console.log('Cart items:', cartItems)
  console.log('Is authenticated:', isAuthenticated)
  console.log('User:', user)
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: ''
  })
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Please sign in to continue</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to place an order</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some items to your cart first</p>
            <Button onClick={() => navigate('/')}>
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
              <p className="text-muted-foreground mb-2">Your order has been received and is being prepared.</p>
              <p className="text-lg font-medium mb-6">Order ID: #{orderId}</p>
              
              <div className="space-y-3 mb-8">
                <Button 
                  onClick={() => navigate(`/track/${orderId}`)}
                  className="w-full"
                >
                  Track Your Order
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
      toast.error('Please fill in all required delivery information')
      return
    }
    
    setStep(2)
  }

    const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Payment submit handler called!')
    console.log('Payment info:', paymentInfo)
    console.log('Cart items:', cartItems)
    
    // Less strict validation for testing
    if (!paymentInfo.cardNumber || !paymentInfo.cardName) {
      console.log('Validation failed - missing basic payment info')
      toast.error('Please fill in card number and name')
      return
    }
    
    console.log('Validation passed - proceeding with order creation')
    setLoading(true)
    
    const orderItems = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const finalTotal = totalPrice + 2.99 + (totalPrice * 0.08);

    console.log('Creating order with items:', orderItems)
    console.log('User:', user)
    
    try {
      const newOrder = await addOrder({
        customerName: user?.name || 'Customer',
        items: orderItems,
        total: finalTotal,
        status: 'pending',
        deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city} ${deliveryInfo.zipCode}`
      })

      console.log('New order created:', newOrder)

      deductStock(orderItems);
      addLoyaltyPoints(Math.floor(finalTotal * 10));
      
      setOrderId(newOrder.id)
      setOrderPlaced(true)
      clearCart()
      toast.success('Order placed successfully! Loyalty points added.')
    } catch (err) {
      console.error(err)
      toast.error('Could not place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= stepNumber 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {stepNumber < step ? '✓' : stepNumber}
          </div>
          {stepNumber < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step > stepNumber ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {renderStepIndicator()}
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDeliverySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={deliveryInfo.name}
                          onChange={(e) => setDeliveryInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={deliveryInfo.email}
                          onChange={(e) => setDeliveryInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={deliveryInfo.phone}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        value={deliveryInfo.address}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main St, Apt 4B"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={deliveryInfo.city}
                          onChange={(e) => setDeliveryInfo(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={deliveryInfo.zipCode}
                          onChange={(e) => setDeliveryInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                          placeholder="10001"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Input
                        id="notes"
                        value={deliveryInfo.notes}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Leave at door, ring bell twice, etc."
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Cardholder Name *</Label>
                      <Input
                        id="cardName"
                        value={paymentInfo.cardName}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardName: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Demo Mode:</strong> This is a test payment. No actual charges will be made.
                      </p>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
                      </Button>
                    </div>
                    
                    {/* Debug Test Button */}
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={async () => {
                          console.log('TEST: Direct order creation')
                          const testOrder = {
                            customerName: user?.name || 'Test Customer',
                            items: cartItems.map(item => ({
                              name: item.name,
                              quantity: item.quantity,
                              price: item.price
                            })),
                            total: totalPrice + 2.99 + (totalPrice * 0.08),
                            status: 'pending' as const,
                            deliveryAddress: 'Test Address'
                          }
                          try {
                            const newOrder = await addOrder(testOrder)
                            console.log('TEST: Order created:', newOrder)
                            toast.success('Test order created!')
                          } catch {
                            toast.error('Test order failed')
                          }
                        }}
                        className="w-full"
                      >
                        🧪 TEST: Create Order Directly
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>$2.99</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(totalPrice + 2.99 + totalPrice * 0.08).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Estimated delivery:</strong> 30-45 minutes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CheckoutFlow
