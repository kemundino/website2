import { useAuth } from "@/context/AuthContextFirebase";
import { useCustomerOrders } from "@/hooks/useRealtimeOrders";
import { FeedbackService } from "@/firebase/firestore";
import { Package, Clock, Truck, CheckCircle2, ExternalLink, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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
  const [feedbackKeys, setFeedbackKeys] = useState<Set<string>>(new Set());

  const { orders, confirmDelivery } = useCustomerOrders(user?.name);

  useEffect(() => {
    const unsub = FeedbackService.subscribe((rows) => {
      const s = new Set<string>();
      (rows as Record<string, unknown>[]).forEach((r) => {
        const fk = r.feedbackKey as string | undefined;
        if (fk) s.add(fk);
        else if (r.orderId && r.itemName) {
          s.add(`${r.orderId}_${r.itemName}`);
        }
      });
      setFeedbackKeys(s);
    });
    return () => unsub();
  }, []);

  const handleConfirmDelivery = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    
    try {
      const success = await confirmDelivery(orderId);
      if (success) {
        toast.success('Delivery confirmed successfully! 🎉');
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
  };

  const checkIfFeedbackGiven = (key: string) => feedbackKeys.has(key);

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
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Order #{order.id}</span>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric", 
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs sm:text-sm font-medium ${status.color} w-fit`}>
                      <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">{status.label}</span>
                      <span className="xs:hidden">{status.label.split(' ')[0]}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 w-full sm:w-auto">
                      {/* Show confirmation button for awaiting_confirmation orders */}
                      {order.status === 'awaiting_confirmation' && (
                        <Button 
                          onClick={() => handleConfirmDelivery(order.id)}
                          disabled={confirmingOrderId === order.id}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 xs:flex-none"
                          size="sm"
                        >
                          {confirmingOrderId === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                              <span className="hidden xs:inline">Confirming...</span>
                              <span className="xs:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden xs:inline">Confirm Delivery</span>
                              <span className="xs:hidden">Confirm</span>
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Link to={`/track/${order.id}`} className="flex-1 xs:flex-none">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Track Order</span>
                          <span className="xs:hidden">Track</span>
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
                    <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-foreground text-sm flex-1">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-foreground text-sm whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      {/* Feedback section directly under each item for delivered orders */}
                      {order.status === 'delivered' && !checkIfFeedbackGiven(`${order.id}_${item.name}`) && (
                        <div className="mt-2">
                          <FeedbackModal
                            itemName={item.name}
                            orderId={`${order.id}_${item.name}`}
                            onFeedback={handleFeedback}
                          >
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 text-xs w-full">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Rate this item</span>
                              <span className="sm:hidden">Rate</span>
                            </Button>
                          </FeedbackModal>
                        </div>
                      )}
                        
                        {order.status === 'delivered' && checkIfFeedbackGiven(`${order.id}_${item.name}`) && (
                          <div className="mt-2 flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Feedback submitted</span>
                            <span className="sm:hidden">Rated</span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground flex-1">📍 {order.deliveryAddress}</span>
                  <div className="flex items-center justify-between xs:justify-end gap-2 w-full xs:w-auto">
                    <span className="text-xs text-muted-foreground xs:hidden">Total:</span>
                    <span className="font-bold text-foreground text-base sm:text-lg">${order.total.toFixed(2)}</span>
                  </div>
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
