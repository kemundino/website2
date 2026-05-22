import { Link, useLocation } from "react-router-dom";
import { LogOut, ChefHat, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContextFirebase";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    // Admin navigation
    ...(user?.role === "admin" ? [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/profile", label: "Profile" }
    ] : user?.role === "staff" ? [
      // Staff navigation
      { to: "/staff", label: "My Portal" },
      { to: "/orders", label: "My Orders" },
      { to: "/profile", label: "Profile" }
    ] : [
      // Customer navigation
      { to: "/", label: "Menu" },
      { to: "/cart", label: "Cart" },
      { to: "/contact", label: "Contact" },
      ...(isAuthenticated ? [
        { to: "/orders", label: "Orders" },
        { to: "/profile", label: "Profile" }
      ] : [])
    ])
  ];

  const isActive = (path: string) => location.pathname === path;

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-warm">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">BiteBuzz</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {link.label === "Cart" && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">Hi, {user?.name}</span>
              <button onClick={logout} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-lg gradient-warm px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex items-center justify-center rounded-lg p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              
              {/* Left Sidebar */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[80%] max-w-sm flex-col border-r border-border bg-card shadow-xl md:hidden"
              >
                <div className="flex items-center justify-between border-b border-border p-4">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-warm">
                      <ChefHat className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-display text-xl font-bold text-foreground">BiteBuzz</span>
                  </Link>
                  <button
                    className="flex items-center justify-center rounded-lg p-2 hover:bg-muted text-muted-foreground transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`relative flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(link.to)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{link.label}</span>
                      {link.label === "Cart" && totalItems > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Mobile user section */}
                <div className="border-t border-border p-4">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-2">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                          <span className="text-sm font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{user?.name}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex w-full items-center justify-center rounded-lg gradient-warm px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
