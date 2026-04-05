import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { UnifiedItemsProvider } from "@/context/UnifiedItemsContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import OrdersPage from "./pages/OrdersPage";
import AdminPage from "./pages/AdminPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import NotFound from "./pages/NotFound";
import AdminRoute from "@/components/AdminRoute";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

// Admin redirect component
const AdminRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Only redirect if admin is logged in but NOT already on admin pages
    if (isAuthenticated && user?.role === "admin" && !location.pathname.startsWith('/admin')) {
      window.location.href = "/admin";
    }
  }, [isAuthenticated, user, location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <UnifiedItemsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <AdminRedirect />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/menu" element={<Navigate to="/" replace />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<CustomerProfilePage />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />
                <Route path="/admin/profile" element={
                  <AdminRoute>
                    <AdminProfilePage />
                  </AdminRoute>
                } />
                <Route path="/admin-profile" element={<Navigate to="/admin/profile" replace />} />
                <Route path="/track" element={<OrderTrackingPage />} />
                <Route path="/track/:orderId" element={<OrderTrackingPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </UnifiedItemsProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
