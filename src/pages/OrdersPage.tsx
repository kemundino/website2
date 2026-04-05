import { useAuth } from "@/context/AuthContext";
import { useCustomerOrders } from "@/hooks/useRealtimeOrders";
import { Package, Clock, Truck, CheckCircle2, ExternalLink, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import FeedbackModal from "@/components/FeedbackModal";

interface Order {
  id: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'on_the_way' | 'delivered' | 'awaiting_confirmation' | 'confirmed';
  createdAt: string;
  deliveryAddress: string;
  customerConfirmed?: boolean;
}

const statusConfig = {
  pending: { label: "Pending", icon: Package, color: "text-secondary", step: 0 },
  processing: { label: "Processing", icon: Clock, color: "text-primary", step: 1 },
  on_the_way: { label: "On the Way", icon: Truck, color: "text-accent", step: 2 },
  confirmed: { label: "Confirmed", icon: Package, color: "text-purple-600", step: 3 },
  awaiting_confirmation: { label: "Awaiting Confirmation", icon: Package, color: "text-purple-600", step: 4 },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-green-600", step: 5 },
};

const OrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  
  // Add error handling for the hook
  let orders: Order[] = [];
  let confirmDelivery: (orderId: string) => boolean = () => false;
  
  try {
    const ordersData = useCustomerOrders(user?.name);
    orders = ordersData.orders || [];
    confirmDelivery = ordersData.confirmDelivery || (() => false);
  } catch (error) {
    console.error('Error loading orders:', error);
    orders = [];
  }

  const handleConfirmDelivery = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    
    try {
      const success = confirmDelivery(orderId);
      if (success) {
        toast.success('Delivery confirmed successfully! 🎉');
        // Professional approach: trigger a re-render through the hook's state update
        // The useCustomerOrders hook will automatically update when the underlying orders change
      } else {
        toast.error('Failed to confirm delivery');
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error('Something went wrong');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleFeedback = (orderId: string, feedback: { rating: number; comment: string }) => {
    console.log('Feedback submitted:', orderId, feedback);
    // In a real app, this would send to a server
  };

  const checkIfFeedbackGiven = (orderId: string) => {
    const existingFeedback = JSON.parse(localStorage.getItem('bitebuzz_feedback') || '{}');
    return existingFeedback[orderId] ? true : false;
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Sign in to view orders</h2>
        <Link to="/auth" className="rounded-xl gradient-warm px-6 py-3 font-semibold text-primary-foreground">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Your Orders</h1>
        <Link to="/track">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Track Order
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No orders yet. Start exploring our menu!</p>
          <Link to="/" className="mt-4 inline-block rounded-xl gradient-warm px-6 py-3 font-semibold text-primary-foreground">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: Order, idx: number) => {
            const status = statusConfig[order.status as keyof typeof statusConfig];
            
            // Handle unknown status gracefully
            if (!status) {
              console.warn(`Unknown order status: ${order.status}`);
              return null;
            }
            
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="mb-4 flex flex-col gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Order #{order.id}</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className={`flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium ${status.color} w-fit`}>
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Show confirmation button for awaiting_confirmation orders */}
                      {order.status === 'awaiting_confirmation' && (
                        <Button 
                          onClick={() => handleConfirmDelivery(order.id)}
                          disabled={confirmingOrderId === order.id}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                          size="sm"
                        >
                          {confirmingOrderId === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              <span className="hidden sm:inline">Confirming...</span>
                              <span className="sm:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Confirm Delivery</span>
                              <span className="sm:hidden">Confirm</span>
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Link to={`/track/${order.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Track</span>
                          <span className="sm:hidden">Track</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4 flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        step <= status.step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {order.items.map((item: { name: string; quantity: number; price: number }, i: number) => (
                    <div key={i} className="flex flex-col gap-1 p-2 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-foreground">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      {/* Feedback section directly under each item for delivered orders */}
                      {order.status === 'delivered' && !checkIfFeedbackGiven(`${order.id}_${item.name}`) && (
                        <div className="mt-2">
                          <FeedbackModal
                            itemName={item.name}
                            orderId={`${order.id}_${item.name}`}
                            onFeedback={handleFeedback}
                          >
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 h-7 text-xs w-full">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Rate this item
                            </Button>
                          </FeedbackModal>
                        </div>
                      )}
                        
                        {order.status === 'delivered' && checkIfFeedbackGiven(`${order.id}_${item.name}`) && (
                          <div className="mt-2 flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Feedback submitted</span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">📍 {order.deliveryAddress}</span>
                  <span className="font-bold text-foreground">${order.total.toFixed(2)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
