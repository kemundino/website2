import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContextFirebase";
import { useUnifiedItems } from "@/context/UnifiedItemsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, ShoppingCart, BarChart3, Warehouse, MessageSquare, Settings, LayoutDashboard, Utensils, Pencil, Trash2, MapPin, Users, ChefHat, UserPlus, Calendar, Activity, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import LiveOrders from "@/components/LiveOrders";
import OrderDemo from "@/components/OrderDemo";
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
  const { user } = useAuth();
  const { items, addItem, updateItem, deleteItem } = useUnifiedItems();
  const [tab, setTab] = useState<"menu" | "orders" | "analytics" | "inventory" | "custom-items" | "feedback" | "tables" | "kitchen" | "staff" | "reservations" | "operations">("analytics");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  // Separate regular and custom items
  const regularItems = items.filter(item => item.tag === 'regular');
  const customItems = items.filter(item => item.tag === 'custom');

  // Helper functions for mobile dropdown
  const getTabIcon = (tabName: string) => {
    switch(tabName) {
      case 'custom-items': return <Utensils className="h-4 w-4" />;
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      case 'tables': return <MapPin className="h-4 w-4" />;
      case 'kitchen': return <ChefHat className="h-4 w-4" />;
      case 'staff': return <UserPlus className="h-4 w-4" />;
      case 'reservations': return <Calendar className="h-4 w-4" />;
      case 'operations': return <Activity className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'orders': return <ShoppingCart className="h-4 w-4" />;
      case 'inventory': return <Warehouse className="h-4 w-4" />;
      case 'menu': return <Package className="h-4 w-4" />;
      default: return <LayoutDashboard className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tabName: string) => {
    switch(tabName) {
      case 'custom-items': return 'Custom Items';
      case 'feedback': return 'Feedback';
      case 'tables': return 'Tables';
      case 'kitchen': return 'Kitchen';
      case 'staff': return 'Staff';
      case 'reservations': return 'Reservations';
      case 'operations': return 'Operations';
      default: return tabName.charAt(0).toUpperCase() + tabName.slice(1);
    }
  };

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
    // Navigate to custom items tab and pre-fill the form
    setTab("custom-items");
    // This will trigger the edit mode in CustomItemManager
    setTimeout(() => {
      // Find and click the edit button for this item
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -py-6 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Admin Dashboard</h1>
        </div>
      </div>

      {/* Mobile-friendly Tabs */}
      <div className="mb-6">
        {/* Mobile dropdown menu */}
        <div className="sm:hidden">
          <div className="relative">
            <button
              onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                {getTabIcon(tab)}
                {getTabLabel(tab)}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {mobileDropdownOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                <div className="max-h-64 overflow-y-auto">
                  {(["analytics", "orders", "inventory", "menu", "custom-items", "feedback", "tables", "kitchen", "staff", "reservations", "operations"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setMobileDropdownOpen(false); }}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-accent ${
                        tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {getTabIcon(t)}
                      <span>{getTabLabel(t)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop tabs */}
        <div className="hidden gap-2 flex-wrap sm:flex">
          {(["analytics", "orders", "inventory", "menu", "custom-items", "feedback", "tables", "kitchen", "staff", "reservations", "operations"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "custom-items" ? (
                <span className="flex items-center gap-1">
                  <Utensils className="h-3 w-3" />
                  Custom Items
                </span>
              ) : t === "feedback" ? (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Feedback
                </span>
              ) : t === "tables" ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Tables
                </span>
              ) : t === "kitchen" ? (
                <span className="flex items-center gap-1">
                  <ChefHat className="h-3 w-3" />
                  Kitchen
                </span>
              ) : t === "staff" ? (
                <span className="flex items-center gap-1">
                  <UserPlus className="h-3 w-3" />
                  Staff
                </span>
              ) : t === "reservations" ? (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Reservations
                </span>
              ) : t === "operations" ? (
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Operations
                </span>
              ) : (
                t
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "analytics" && <AnalyticsDashboard />}

      {tab === "inventory" && <InventoryManagement />}

      {tab === "menu" && (
        <div>
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="mb-4 flex items-center gap-2 rounded-xl gradient-warm px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
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

          {/* Regular Menu Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Regular Menu Items</h3>
            <div className="space-y-3">
              {regularItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-card"
                >
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.category} · ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditItem(item); setShowForm(true); }}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Custom Menu Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Custom Items
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {customItems.length}
              </span>
            </h3>
            <div className="space-y-3">
              {customItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No custom items yet</p>
                  <p className="text-sm">Go to Custom Items tab to add some</p>
                </div>
              ) : (
                customItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    data-custom-item-id={item.id}
                    className="flex items-center gap-4 rounded-xl border border-purple-200 bg-purple-50 p-3 shadow-card"
                  >
                    <img src={item.image || '/api/placeholder/300/200'} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.category || 'Custom'} · ${item.price.toFixed(2)}
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Custom</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCustomItem(item)}
                        className="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomItem(item.id, item.name)}
                        className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div>
          <OrderDemo />
          <LiveOrders />
        </div>
      )}

      {tab === "custom-items" && <CustomItemManager />}

      {tab === "feedback" && <FeedbackManagement />}

      {tab === "tables" && <TableManagement />}

      {tab === "kitchen" && <KitchenDisplaySystem />}

      {tab === "staff" && <StaffManagement />}

      {tab === "reservations" && <ReservationSystem />}

      {tab === "operations" && <RestaurantOperationsDashboard />}
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
