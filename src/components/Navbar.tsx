import { Link, useLocation } from "react-router-dom";
import { LogOut, ChefHat, Menu, X, LayoutDashboard, User as UserIcon, Briefcase, Package, Utensils, ShoppingCart, Phone } from "lucide-react";
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
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/profile", label: "Profile", icon: UserIcon }
    ] : user?.role === "staff" ? [
      // Staff navigation
      { to: "/staff", label: "My Portal", icon: Briefcase },
      { to: "/orders", label: "My Orders", icon: Package },
      { to: "/profile", label: "Profile", icon: UserIcon }
    ] : [
      // Customer navigation
      { to: "/", label: "Menu", icon: Utensils },
      { to: "/cart", label: "Cart", icon: ShoppingCart },
      { to: "/contact", label: "Contact", icon: Phone },
      ...(isAuthenticated ? [
        { to: "/orders", label: "Orders", icon: Package },
        { to: "/profile", label: "Profile", icon: UserIcon }
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
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              
              {/* Dark Glass Sidebar */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-slate-950/70 backdrop-blur-2xl text-slate-100 md:hidden shadow-2xl"
              >
                {/* Header & User Profile */}
                <div className="p-6 pb-4 border-b border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-2xl font-bold tracking-wide text-white">BiteBuzz</h2>
                    <button
                      className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {isAuthenticated && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 shadow-inner">
                        <span className="text-sm font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{user?.name}</span>
                        <span className="text-xs text-slate-400">My Account</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Menu Title */}
                <div className="px-6 py-4 text-xs font-semibold tracking-wider text-slate-400">
                  MENU
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`group relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive(link.to)
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Icon className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                        <span>{link.label}</span>
                        {link.label === "Cart" && totalItems > 0 && (
                          <span className="absolute right-4 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-lg">
                            {totalItems}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom Section */}
                <div className="mt-auto border-t border-white/5 p-4">
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <LogOut className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex w-full items-center justify-center rounded-xl bg-blue-600/90 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-transform hover:scale-[1.02] hover:bg-blue-600"
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
