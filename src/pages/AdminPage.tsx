import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContextFirebase";
import { useUnifiedItems, MenuItem } from "@/context/UnifiedItemsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Package, ShoppingCart, BarChart3, Warehouse, MessageSquare, Settings, LayoutDashboard, Utensils, Pencil, Trash2, MapPin, Users, ChefHat, UserPlus, Calendar, Activity, ChevronDown, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import LiveOrders from "@/components/LiveOrders";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import InventoryManagement from "@/components/InventoryManagement";
import CustomItemManager from "@/components/CustomItemManager";
import FeedbackManagement from "@/components/FeedbackManagement";
import TableManagement from "@/components/TableManagement";
import KitchenDisplaySystem from "@/components/KitchenDisplaySystem";
import StaffManagement from "@/components/StaffManagement";
import ReservationSystem from "@/components/ReservationSystem";
import RestaurantOperationsDashboard from "@/components/RestaurantOperationsDashboard";

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem } = useUnifiedItems();
  const [tab, setTab] = useState<"menu" | "orders" | "analytics" | "inventory" | "custom-items" | "feedback" | "tables" | "kitchen" | "staff" | "reservations" | "operations">("analytics");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  // Separate regular and custom items
  const regularItems = items.filter(item => item.tag === 'regular');
  const customItems = items.filter(item => item.tag === 'custom');

  const sidebarItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'menu', label: 'Menu', icon: Package },
    { id: 'custom-items', label: 'Custom Items', icon: Utensils },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'tables', label: 'Tables', icon: MapPin },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'staff', label: 'Staff', icon: UserPlus },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'operations', label: 'Operations', icon: Activity },
  ] as const;

  if (!user || user.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  const handleDelete = (id: string) => {
    const success = deleteItem(id);
    if (success) {
      toast.success("Item deleted");
    }
  };

  const handleEditCustomItem = (item: any) => {
    setTab("custom-items");
    setTimeout(() => {
      const editButton = document.querySelector(`[data-custom-item-id="${item.id}"] .edit-button`) as HTMLButtonElement;
      if (editButton) {
        editButton.click();
      }
    }, 100);
  };

  const handleDeleteCustomItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteItem(id);
      if (success) {
        toast.success('Custom item deleted successfully! 🗑️');
      }
    }
  };

  const handleSave = (item: any) => {
    if (editItem) {
      const success = updateItem(editItem.id, item);
      if (success) {
        toast.success("Item updated");
      }
    } else {
      addItem({ ...item, tag: 'regular' });
      toast.success("Item added");
    }
    setEditItem(null);
    setShowForm(false);
  };

  const activeItem = sidebarItems.find(i => i.id === tab);

  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-80 flex-col border-r border-border bg-card h-full overflow-y-auto scrollbar-thin">
        <div className="p-8 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <LayoutDashboard className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">BiteBuzz Admin</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-2.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-base md:text-lg font-medium transition-all group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:scale-110 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-indicator"
                    className="ml-auto w-2 h-2 rounded-full bg-primary-foreground"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-border">
          <div className="p-5 rounded-2xl bg-muted/50 border border-border/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Logged in as</p>
            <p className="text-base md:text-lg font-bold truncate text-foreground">{user.name}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background h-full overflow-y-auto scrollbar-thin">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-xl font-bold tracking-tight">Admin Panel</h1>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-5 py-4 text-left text-base font-semibold text-foreground transition-all active:scale-[0.98] shadow-sm"
            >
              <span className="flex items-center gap-4">
                {activeItem && <activeItem.icon className="h-5 w-5 text-primary" />}
                {activeItem?.label || tab}
              </span>
              <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {mobileDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 z-50 mt-2.5 w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              >
                <div className="max-h-96 overflow-y-auto p-2.5 space-y-1.5">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setTab(item.id); setMobileDropdownOpen(false); }}
                      className={`flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left text-base font-medium transition-colors ${
                        tab === item.id 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${tab === item.id ? "text-primary-foreground" : "text-primary/70"}`} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-5 md:p-10 lg:p-12 max-w-7xl">
          <header className="hidden lg:flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                {activeItem?.label || tab}
              </h2>
              <p className="text-lg text-muted-foreground">Manage your restaurant {tab.replace('-', ' ')} with ease.</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-5 p-2 pr-6 rounded-full bg-card border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold text-foreground">{user.name}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{user.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border">
                <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-muted-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem 
                  onClick={() => navigate('/admin/profile')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors focus:bg-primary focus:text-primary-foreground group"
                >
                  <User className="h-4 w-4 group-focus:text-primary-foreground" />
                  <span className="font-medium">Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground group"
                >
                  <LogOut className="h-4 w-4 group-focus:text-destructive-foreground" />
                  <span className="font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {tab === "analytics" && <AnalyticsDashboard />}

            {tab === "inventory" && <InventoryManagement />}

            {tab === "menu" && (
              <div>
                <button
                  onClick={() => { setEditItem(null); setShowForm(true); }}
                  className="mb-6 flex items-center gap-2 rounded-xl gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-orange-500/20 transition-transform hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Add Regular Menu Item
                </button>

                {showForm && (
                  <ItemForm
                    item={editItem}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditItem(null); }}
                  />
                )}

                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Regular Menu Items */}
                  <Card className="border-none shadow-card overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Regular Menu Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {regularItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-hover hover:border-primary/30"
                        >
                          <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">{item.category} · ${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditItem(item); setShowForm(true); }}
                              className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded-lg p-2.5 text-destructive transition-colors hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Custom Menu Items */}
                  <Card className="border-none shadow-card overflow-hidden">
                    <CardHeader className="bg-purple-50/50 pb-4">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-purple-600" />
                        Custom Items
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full ml-auto">
                          {customItems.length} items
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {customItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Utensils className="h-12 w-12 mx-auto mb-4 text-purple-200" />
                          <p className="text-lg font-medium">No custom items</p>
                          <p className="text-sm">They appear here once created</p>
                        </div>
                      ) : (
                        customItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            data-custom-item-id={item.id}
                            className="flex items-center gap-4 rounded-xl border border-purple-100 bg-purple-50/30 p-3 transition-hover hover:border-purple-300"
                          >
                            <img src={item.image || '/api/placeholder/300/200'} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.category || 'Custom'} · ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCustomItem(item)}
                                className="rounded-lg p-2.5 text-purple-600 transition-colors hover:bg-purple-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCustomItem(item.id, item.name)}
                                className="rounded-lg p-2.5 text-destructive transition-colors hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {tab === "orders" && <LiveOrders />}

            {tab === "custom-items" && <CustomItemManager />}

            {tab === "feedback" && <FeedbackManagement />}

            {tab === "tables" && <TableManagement />}

            {tab === "kitchen" && <KitchenDisplaySystem />}

            {tab === "staff" && <StaffManagement />}

            {tab === "reservations" && <ReservationSystem />}

            {tab === "operations" && <RestaurantOperationsDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
};

const ItemForm = ({
  item,
  onSave,
  onCancel,
}: {
  item: MenuItem | null;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<MenuItem>(
    item || {
      id: "",
      name: "",
      description: "",
      price: 0,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      category: "pizza",
      rating: 4.5,
      prepTime: "15 min",
      isVeg: false,
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <h3 className="mb-4 font-display text-lg font-bold text-foreground">
        {item ? "Edit Item" : "New Item"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
          className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:col-span-2"
        />
        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:col-span-2"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {["pizza", "burgers", "sushi", "salads", "pasta", "desserts", "drinks"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isVeg}
            onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
            className="rounded"
          />
          Vegetarian
        </label>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onSave(form)}
          className="rounded-xl gradient-warm px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default AdminPage;
