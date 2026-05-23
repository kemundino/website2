import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContextFirebase";
import { useUnifiedItems, UnifiedItem } from "@/context/UnifiedItemsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Plus, Package, ShoppingCart, BarChart3, Warehouse, MessageSquare,
  Settings, LayoutDashboard, Utensils, Pencil, Trash2, MapPin,
  Users, ChefHat, UserPlus, Calendar, Activity, ChevronDown,
  Sparkles, LogOut, Menu as MenuIcon, X, Star, Clock, User as UserIcon,
  ShieldCheck, ExternalLink, Image as ImageIcon, Upload, Camera, Globe,
  Coffee, Sun, Moon, Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import LiveOrdersManagement from "@/components/LiveOrders";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import InventoryManagement from "@/components/InventoryManagement";
import FeedbackManagement from "@/components/FeedbackManagement";
import TableManagement from "@/components/TableManagement";
import KitchenDisplaySystem from "@/components/KitchenDisplaySystem";
import StaffManagement from "@/components/StaffManagement";
import ReservationSystem from "@/components/ReservationSystem";
import RestaurantOperationsDashboard from "@/components/RestaurantOperationsDashboard";
import AdminProfilePage from "@/pages/AdminProfilePage";
import UserManagement from "@/components/UserManagement";
import { useTheme } from "@/context/ThemeContext";

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem } = useUnifiedItems();
  const [tab, setTab] = useState<string>("regular-items");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [editItem, setEditItem] = useState<UnifiedItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const root = document.getElementById("root");
    if (isSidebarOpen) {
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
  }, [isSidebarOpen]);

  if (!user || user.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  const menuItems = [
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "orders", label: "Orders", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "users", label: "Users", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "inventory", label: "Inventory", icon: Warehouse, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "regular-items", label: "Regular Items", icon: Coffee, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "custom-items", label: "Custom Items", icon: Utensils, color: "text-pink-500", bg: "bg-pink-50" },
    { id: "feedback", label: "Feedback", icon: MessageSquare, color: "text-yellow-500", bg: "bg-yellow-50" },
    { id: "tables", label: "Tables", icon: MapPin, color: "text-red-500", bg: "bg-red-50" },
    { id: "kitchen", label: "Kitchen", icon: ChefHat, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "staff", label: "Staff", icon: UserPlus, color: "text-cyan-500", bg: "bg-cyan-50" },
    { id: "reservations", label: "Reservations", icon: Calendar, color: "text-rose-500", bg: "bg-rose-50" },
    { id: "operations", label: "Operations", icon: Activity, color: "text-slate-500 dark:text-muted-foreground", bg: "bg-slate-50 dark:bg-background" },
    { id: "profile", label: "My Profile", icon: UserIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const regularItems = (items || []).filter(item => item?.tag === 'regular');
  const customItems = (items || []).filter(item => item?.tag === 'custom');

  const handleSave = (itemData: any) => {
    try {
      if (editItem) {
        const success = updateItem(editItem.id, itemData);
        if (success) toast.success("Creation updated successfully");
      } else {
        addItem({
          ...itemData,
          rating: itemData.rating || 4.5,
          prepTime: itemData.prepTime || "15-20 min",
          tag: itemData.tag || (tab === 'custom-items' ? 'custom' : 'regular')
        });
        toast.success(`New ${itemData.tag || (tab === 'custom-items' ? 'custom' : 'regular')} creation added`);
      }
      setEditItem(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save menu item");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this creation permanently?")) {
      const success = deleteItem(id);
      if (success) toast.success("Item scrubbed from menu");
    }
  };

  const MenuCard = ({ item }: { item: UnifiedItem }) => (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      className={`group bg-white dark:bg-card rounded-[2.5rem] border overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ${item.tag === 'custom' ? 'border-purple-100 shadow-purple-50' : 'border-slate-100 dark:border-border/50'
        }`}
    >
      <div className="h-56 relative overflow-hidden">
        <img
          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" }}
        />
        <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          <button onClick={() => { setEditItem(item); setShowForm(true); }} className="p-3 bg-white dark:bg-card/90 backdrop-blur-md rounded-2xl text-slate-800 dark:text-foreground shadow-xl hover:text-primary transition-colors"><Pencil size={20} /></button>
          <button onClick={() => handleDelete(item.id)} className="p-3 bg-white dark:bg-card/90 backdrop-blur-md rounded-2xl text-destructive shadow-xl hover:bg-destructive hover:text-white dark:text-background transition-colors"><Trash2 size={20} /></button>
        </div>
        <div className="absolute bottom-5 left-5">
          <Badge className="bg-white dark:bg-card/90 backdrop-blur-md text-slate-900 dark:text-foreground border-none font-black text-lg px-4 py-1.5 rounded-2xl shadow-xl">
            ${(item.price || 0).toFixed(2)}
          </Badge>
        </div>
        {item.tag === 'custom' && (
          <div className="absolute top-5 left-5">
            <Badge className="bg-purple-600 text-white dark:text-background border-none font-black text-[10px] uppercase px-3 py-1 rounded-lg shadow-xl tracking-widest">
              Custom Creation
            </Badge>
          </div>
        )}
      </div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-black text-2xl text-slate-900 dark:text-foreground tracking-tight leading-tight">{item.name}</h4>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground font-bold px-3 py-1 rounded-lg border-none uppercase text-[10px]">
            {item.category}
          </Badge>
          <div className="flex items-center text-yellow-500 text-sm font-bold">
            <Star className="h-3.5 w-3.5 fill-current mr-1" />
            {item.rating || 4.5}
          </div>
        </div>
        <p className="text-slate-500 dark:text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed h-10">
          {item.description || "A masterful culinary creation prepared with precision."}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background overflow-hidden font-body">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white dark:bg-card border-r border-slate-200 dark:border-border shadow-sm z-30 transition-all duration-500">
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => setTab("analytics")}>
            <div className="p-2.5 bg-slate-900 dark:bg-foreground rounded-2xl shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform">
              <Utensils className="h-6 w-6 text-white dark:text-background" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-slate-900 dark:text-foreground tracking-tighter leading-none">Admin<span className="text-primary italic">Pro</span></h2>
              <p className="text-[9px] uppercase font-black text-slate-400 dark:text-muted-foreground/80 tracking-[0.2em] mt-1">Management Suite</p>
            </div>
          </div>

          <nav className="space-y-1 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 xl:px-4 py-3 rounded-2xl font-bold text-xs xl:text-sm transition-all duration-300 ${isActive
                    ? "bg-slate-900 dark:bg-foreground text-white dark:text-background shadow-2xl shadow-slate-300 scale-[1.02]"
                    : "text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:bg-background hover:text-slate-900 dark:text-foreground"
                    }`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-white dark:bg-card/10" : item.bg}`}>
                    <Icon className={`h-4 w-4 ${isActive ? "text-white dark:text-background" : item.color}`} />
                  </div>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border/50">
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-background border border-slate-100 dark:border-border/50">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-widest">System Status</span>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-foreground/90 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All nodes operational
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] lg:hidden"
              />
              <motion.aside
                key="sidebar"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.4 }}
                className="fixed inset-y-0 left-0 z-[110] flex w-[60vw] flex-col bg-white dark:bg-card text-slate-900 dark:text-foreground lg:hidden shadow-2xl border-r border-slate-200 dark:border-border p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 dark:bg-foreground rounded-xl">
                      <Utensils className="h-6 w-6 text-white dark:text-background" />
                    </div>
                    <span className="font-display font-black text-2xl text-slate-900 dark:text-foreground tracking-tight">AdminPro</span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <nav className="space-y-1 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = tab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setTab(item.id); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${isActive ? "bg-slate-900 dark:bg-foreground text-white dark:text-background shadow-xl shadow-slate-200" : "text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:bg-background"
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-border/50">
                  <Button variant="ghost" className="w-full h-14 justify-start rounded-2xl font-black mb-2" onClick={() => { setTab('profile'); setIsSidebarOpen(false); }}>
                    <UserIcon className="h-5 w-5 mr-3" /> My Profile
                  </Button>
                  <Button variant="outline" className="w-full h-14 justify-start rounded-2xl font-black text-destructive border-slate-200 dark:border-border" onClick={logout}>
                    <LogOut className="h-5 w-5 mr-3" /> Sign Out
                  </Button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 dark:bg-background/50">
        {/* Top Navbar */}
        <header className="sticky top-0 w-full bg-white dark:bg-card/80 backdrop-blur-xl border-b border-slate-200 dark:border-border z-40 px-[5%] py-4 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex-1 flex items-center">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl bg-slate-50 dark:bg-background" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon className="h-6 w-6" />
            </Button>
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3" />
                <span>Command Center</span>
              </div>
            </div>
          </div>

          {/* Center Section (Responsive Title) */}
          <div className="flex-1 flex justify-center items-center text-center">
            <div className="flex flex-col items-center">
              <p className="lg:hidden text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-0.5">AdminPro</p>
              <h2 className="text-xs sm:text-lg font-black text-slate-900 dark:text-foreground tracking-tight uppercase sm:capitalize whitespace-nowrap">
                {menuItems.find(i => i.id === tab)?.label}
              </h2>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-[4%]">
            <button
              onClick={cycleTheme}
              title={`Theme: ${theme}`}
              className="rounded-xl p-2 text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:bg-muted transition-colors"
            >
              <ThemeIcon className="h-5 w-5" />
            </button>

            {(tab === "regular-items" || tab === "custom-items") && (
              <Button
                onClick={() => { setEditItem(null); setShowForm(true); }}
                className="h-10 w-10 sm:h-11 sm:w-auto sm:px-6 rounded-xl bg-slate-900 dark:bg-foreground hover:bg-slate-800 dark:bg-accent text-white dark:text-background font-black text-sm shadow-lg shadow-slate-200 transition-all hover:scale-105 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Creation</span>
              </Button>
            )}

            <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block" />

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border hover:border-primary/30 transition-all active:scale-95 shadow-sm"
              >
                <div className="w-9 h-9 rounded-[0.75rem] bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white dark:text-background font-black text-xs">
                  {user.name?.[0] || "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-black text-slate-900 dark:text-foreground leading-none">{user.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-muted-foreground/80 uppercase tracking-tighter mt-1">Administrator</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 dark:text-muted-foreground/80 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm sm:hidden"
                      style={{ position: 'fixed' }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: "100%" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="fixed bottom-0 left-0 right-0 z-[120] w-full rounded-t-[2.5rem] bg-white dark:bg-card/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-100 dark:border-border/50 overflow-hidden sm:absolute sm:top-full sm:right-0 sm:bottom-auto sm:left-auto sm:mt-3 sm:w-72 sm:rounded-[2.25rem] sm:shadow-2xl sm:border sm:border-slate-100 dark:border-border/50 sm:z-50"
                    >
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 sm:hidden" />
                    <div className="p-5 sm:p-6 bg-slate-50 dark:bg-background/50 border-b border-slate-100 dark:border-border/50">
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-[0.2em] mb-1 whitespace-nowrap">Authenticated As</p>
                      <p className="font-black text-slate-900 dark:text-foreground truncate text-xs sm:text-sm">{user.email}</p>
                    </div>
                    <div className="p-2 sm:p-3">
                      <button
                        onClick={() => { setTab('profile'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:bg-background hover:text-slate-900 dark:text-foreground font-bold transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-muted-foreground/80 group-hover:text-primary transition-colors" />
                          <span className="text-xs sm:text-sm">Profile</span>
                        </div>
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <div className="h-[1px] bg-slate-100 dark:bg-muted my-1.5 sm:my-2 mx-2" />

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl text-destructive hover:bg-destructive/5 font-black transition-all"
                      >
                        <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs sm:text-sm">Sign Out</span>
                      </button>
                    </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-16 pt-10">
          {tab === "analytics" && <AnalyticsDashboard />}
          {tab === "orders" && (
            <div className="space-y-10">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-card">
                <LiveOrdersManagement />
              </Card>
            </div>
          )}
          { tab === "inventory" && <InventoryManagement /> }
          { tab === "users" && <UserManagement /> }
          {tab === "regular-items" && (
            <div className="space-y-8 sm:space-y-12">
              <h3 className="text-sm sm:text-lg font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-[0.2em] mb-6 sm:mb-8 ml-2 sm:ml-4">Regular Menu Inventory</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {regularItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
              {regularItems.length === 0 && (
                <div className="py-32 text-center bg-white dark:bg-card rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-border/50">
                  <Package className="h-20 w-20 mx-auto mb-6 text-slate-200" />
                  <h3 className="text-2xl font-black text-slate-400 dark:text-muted-foreground/80">Empty Regular Vault</h3>
                  <p className="text-slate-400 dark:text-muted-foreground/80 font-medium mt-2">Initialize your offerings by creating your first regular menu item.</p>
                  <Button onClick={() => setShowForm(true)} className="mt-8 h-14 px-8 rounded-2xl font-black">Begin Creation</Button>
                </div>
              )}
            </div>
          )}
          {tab === "custom-items" && (
            <div className="space-y-8 sm:space-y-12">
              <h3 className="text-sm sm:text-lg font-black text-purple-400 uppercase tracking-[0.2em] mb-6 sm:mb-8 ml-2 sm:ml-4 flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                Custom Creation Vault
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {customItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
              {customItems.length === 0 && (
                <div className="py-32 text-center bg-white dark:bg-card rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-border/50">
                  <Utensils className="h-20 w-20 mx-auto mb-6 text-slate-200" />
                  <h3 className="text-2xl font-black text-slate-400 dark:text-muted-foreground/80">No Custom Items</h3>
                  <p className="text-slate-400 dark:text-muted-foreground/80 font-medium mt-2">Craft your first bespoke culinary masterpiece.</p>
                  <Button onClick={() => setShowForm(true)} className="mt-8 h-14 px-8 rounded-2xl font-black bg-purple-600 hover:bg-purple-700 text-white dark:text-background border-none shadow-xl shadow-purple-200">Start Crafting</Button>
                </div>
              )}
            </div>
          )}
          {tab === "feedback" && <FeedbackManagement />}
          {tab === "tables" && <TableManagement />}
          {tab === "kitchen" && <KitchenDisplaySystem />}
          {tab === "staff" && <StaffManagement />}
          {tab === "reservations" && <ReservationSystem />}
          {tab === "operations" && <RestaurantOperationsDashboard />}
          {tab === "profile" && <AdminProfilePage onTabChange={(newTab: string) => setTab(newTab)} />}

          {/* Fallback if no tab matches */}
          {!menuItems.some(i => i.id === tab) && (
            <div className="py-20 text-center">
              <p className="text-slate-400 dark:text-muted-foreground/80 font-bold">Please select a section from the sidebar.</p>
            </div>
          )}
        </div>
      </main>

      {/* Item Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowForm(false); setEditItem(null); }}
              className="absolute inset-0 bg-slate-900 dark:bg-foreground/70 backdrop-blur-lg"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl z-10 max-h-[95vh] overflow-y-auto rounded-[3rem] custom-scrollbar"
            >
              <ItemForm
                item={editItem}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditItem(null); }}
                defaultTag={tab === 'custom-items' ? 'custom' : 'regular'}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

const ItemForm = ({ item, onSave, onCancel, defaultTag }: any) => {
  const [form, setForm] = useState(item || {
    name: "", description: "", price: 0,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    category: "pizza", isVeg: false,
    prepTime: "15-20 min", rating: 4.5,
    tag: defaultTag || 'regular'
  });

  return (
    <Card className="rounded-[3rem] border-none bg-white dark:bg-card p-6 sm:p-10 md:p-16 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-foreground tracking-tight">{item ? "Evolve" : "Forge"} Creation</h3>
          <p className="text-slate-400 dark:text-muted-foreground/80 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Culinary Specification Portal</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-widest">Creation Classification</Label>
          <div className="flex bg-slate-100 dark:bg-muted p-1 rounded-xl">
            <button
              onClick={() => setForm({ ...form, tag: 'regular' })}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${form.tag === 'regular' ? 'bg-white dark:bg-card text-slate-900 dark:text-foreground shadow-sm' : 'text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:text-foreground/90'}`}
            >
              Regular
            </button>
            <button
              onClick={() => setForm({ ...form, tag: 'custom' })}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${form.tag === 'custom' ? 'bg-purple-600 text-white dark:text-background shadow-lg shadow-purple-100' : 'text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:text-foreground/90'}`}
            >
              Custom
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:gap-8">
        {/* Image Address Input Area */}
        <div className="space-y-4 bg-slate-50 dark:bg-background p-6 rounded-[2rem] border border-slate-100 dark:border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-primary" />
            <Label className="text-sm font-black text-slate-800 dark:text-foreground">Visual Identity (Image Address)</Label>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white dark:bg-card flex-shrink-0">
              <img
                src={form.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" }}
              />
            </div>
            <div className="flex-1 w-full space-y-3">
              <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-widest">Public URL Address</Label>
              <input
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full h-14 rounded-2xl bg-white dark:bg-card border-2 border-transparent focus:border-primary/20 transition-all px-6 font-bold text-slate-600 dark:text-muted-foreground text-sm outline-none"
              />
              <p className="text-[10px] text-slate-400 dark:text-muted-foreground/80 font-medium italic">Provide a secure URL (HTTPS) for the best result.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-3">
            <Label className="text-xs font-black text-slate-800 dark:text-foreground ml-1 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary" /> Creation Name
            </Label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Imperial Wagyu Burger"
              className="w-full h-16 rounded-[1.25rem] bg-slate-50 dark:bg-background border-2 border-transparent focus:border-primary/20 focus:bg-white dark:bg-card transition-all px-6 font-bold text-slate-900 dark:text-foreground outline-none"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-black text-slate-800 dark:text-foreground ml-1 flex items-center gap-2">
              <DollarSign size={12} className="text-emerald-500" /> Valuation ($)
            </Label>
            <input
              type="number"
              step="0.01"
              value={form.price || ""}
              onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="w-full h-16 rounded-[1.25rem] bg-slate-50 dark:bg-background border-2 border-transparent focus:border-primary/20 focus:bg-white dark:bg-card transition-all px-6 font-bold text-slate-900 dark:text-foreground outline-none"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label className="text-xs font-black text-slate-800 dark:text-foreground ml-1">Narrative Description</Label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the essence of this creation..."
              className="w-full rounded-[1.5rem] bg-slate-50 dark:bg-background border-2 border-transparent focus:border-primary/20 focus:bg-white dark:bg-card transition-all p-6 font-bold text-slate-900 dark:text-foreground outline-none resize-none"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-black text-slate-800 dark:text-foreground ml-1">Classification</Label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full h-16 rounded-[1.25rem] bg-slate-50 dark:bg-background border-2 border-transparent focus:border-primary/20 focus:bg-white dark:bg-card transition-all px-6 font-bold text-slate-900 dark:text-foreground outline-none appearance-none"
            >
              {["pizza", "burgers", "sushi", "salads", "pasta", "desserts", "drinks"].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-black text-slate-800 dark:text-foreground ml-1 flex items-center gap-2">
              <Clock size={12} /> Preparation Time
            </Label>
            <input
              value={form.prepTime}
              onChange={e => setForm({ ...form, prepTime: e.target.value })}
              placeholder="15-20 min"
              className="w-full h-16 rounded-[1.25rem] bg-slate-50 dark:bg-background border-2 border-transparent focus:border-primary/20 focus:bg-white dark:bg-card transition-all px-6 font-bold text-slate-900 dark:text-foreground outline-none"
            />
          </div>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-background p-5 rounded-[1.25rem] border-2 border-transparent hover:border-emerald-100 transition-all">
            <input
              type="checkbox"
              id="isVeg"
              checked={form.isVeg}
              onChange={e => setForm({ ...form, isVeg: e.target.checked })}
              className="w-6 h-6 rounded-lg text-emerald-500 border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <Label htmlFor="isVeg" className="font-black text-slate-700 dark:text-foreground/90 cursor-pointer text-sm">Vegetarian Protocol</Label>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black text-slate-800 dark:text-foreground ml-1">Initial Stock Level</Label>
            <input
              type="number"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
              className="w-full h-16 rounded-[1.25rem] bg-slate-50 dark:bg-background border-2 border-transparent focus:border-primary/20 focus:bg-white dark:bg-card transition-all px-6 font-bold text-slate-900 dark:text-foreground outline-none"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-black text-slate-800 dark:text-foreground ml-1">Unit Type</Label>
            <select
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              className="w-full h-16 rounded-[1.25rem] bg-slate-50 dark:bg-background border-2 border-transparent focus:border-primary/20 focus:bg-white dark:bg-card transition-all px-6 font-bold text-slate-900 dark:text-foreground outline-none appearance-none"
            >
              {["portions", "kg", "grams", "units", "plates", "bottles"].map(u => (
                <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => onSave(form)}
          className="flex-1 h-20 rounded-[1.5rem] bg-slate-900 dark:bg-foreground hover:bg-slate-800 dark:bg-accent text-white dark:text-background font-black text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {item ? "Commit Evolution" : "Finalize Creation"}
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="flex-1 h-20 rounded-[1.5rem] font-bold text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:bg-background"
        >
          Discard
        </Button>
      </div>
    </Card>
  );
};

const DollarSign = ({ size, className }: { size?: number, className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
)

export default AdminPage;
