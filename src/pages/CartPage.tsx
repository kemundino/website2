import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, User, LogIn } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading";
import CheckoutFlow from "@/components/CheckoutFlow";

const CartPage = () => {
  const { items, updateQuantity, removeItem, totalPrice, isGuest } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  const deliveryFee = totalPrice > 30 ? 0 : 4.99;
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Show a more user-friendly message and redirect to auth
      toast.info("Please sign in to complete your order");
      navigate("/auth");
      return;
    }
    setShowCheckout(true);
  };

  const handleSignIn = () => {
    toast.info("Sign in to complete your order");
    navigate("/auth");
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    setUpdatingItem(id);
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    updateQuantity(id, quantity);
    setUpdatingItem(null);
  };

  const handleRemoveItem = async (id: string) => {
    setUpdatingItem(id);
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    removeItem(id);
    toast.success("Item removed from cart");
    setUpdatingItem(null);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex min-h-[60vh] flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" text="Loading your cart..." />
      </div>
    );
  }

  if (showCheckout) {
    return <CheckoutFlow />;
  }

  if (items.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some delicious food to get started!</p>
        <Link to="/" className="mt-4 rounded-xl gradient-warm px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Your Cart</h1>
        {isGuest && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Shopping as guest</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingItem === item.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingItem === item.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingItem === item.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingItem === item.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                      <button 
                        onClick={() => handleRemoveItem(item.id)} 
                        disabled={updatingItem === item.id}
                        className="text-destructive transition-colors hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingItem === item.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-24 lg:self-start">
          <h3 className="font-display text-xl font-bold text-foreground">Order Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-accent">Free delivery on orders over $30!</p>
            )}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span className="text-lg">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {isGuest ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <User className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <p className="text-sm text-blue-800 font-medium">Sign in to complete your order</p>
                <p className="text-xs text-blue-600 mt-1">Your cart will be saved when you sign in</p>
              </div>
              <button
                onClick={handleSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl gradient-warm py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                Sign In to Checkout
              </button>
              <button
                onClick={() => navigate("/auth?mode=register")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 font-semibold text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Account
              </button>
            </div>
          ) : (
            <button
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-warm py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
