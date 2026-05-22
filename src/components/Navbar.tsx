import { Link, useLocation } from "react-router-dom";
import { LogOut, ChefHat, Menu, X, LayoutDashboard, User as UserIcon, Briefcase, Package, Utensils, ShoppingCart, Phone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContextFirebase";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const root = document.getElementById("root");
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.backgroundColor = "#000"; // Prevent white flash behind root
      if (root) {
        root.style.transform = "translateX(60vw)";
        root.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.backgroundColor = "";
      if (root) {
        root.style.transform = "translateX(0)";
        setTimeout(() => {
          if (!document.getElementById("root")?.style.transform.includes("60vw")) {
            root.style.transform = "";
            root.style.transition = "";
          }
        }, 400);
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.backgroundColor = "";
      if (root) {
        root.style.transform = "";
        root.style.transition = "";
      }
    };
  }, [mobileOpen]);

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
          {mobileOpen && typeof document !== 'undefined' && createPortal(
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] md:hidden"
              onClick={() => setMobileOpen(false)}
            />,
            document.body
          )}
          
          {mobileOpen && typeof document !== 'undefined' && createPortal(
            <motion.div
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-[110] flex w-[60vw] flex-col bg-[#171717] text-zinc-100 md:hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <ChefHat className="h-6 w-6 text-white" />
                  <span className="font-display text-lg font-medium text-white">BiteBuzz</span>
                </Link>
                <button
                  className="rounded-md p-2 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                        isActive(link.to)
                          ? "bg-[#212121] text-white"
                          : "text-zinc-300 hover:bg-[#212121] hover:text-white"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="h-5 w-5 opacity-90" />
                      <span className="font-medium">{link.label}</span>
                      {link.label === "Cart" && totalItems > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Bottom User Section (ChatGPT style) */}
              <div className="p-3 border-t border-white/10">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg p-3 text-sm font-medium text-zinc-300 hover:bg-[#212121] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-tr from-blue-500 to-blue-400 text-white">
                        <span className="text-sm font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-white">{user?.name}</span>
                        <span className="text-[11px] text-zinc-400">Log out</span>
                      </div>
                    </div>
                    <LogOut className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in / Sign up
                  </Link>
                )}
              </div>
            </motion.div>,
            document.body
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
