import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, CheckCircle, AlertCircle, ChefHat, Timer, 
  Users, Flame, Bell, Pause, Play, X, Eye,
  Utensils, Package, AlertTriangle, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  startTime?: Date;
  prepTime?: number; // in minutes
  modifications?: string[];
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeout' | 'delivery';
  items: KitchenOrderItem[];
  orderTime: Date;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedTime?: number;
  actualTime?: number;
  assignedTo?: string;
  specialInstructions?: string;
}

interface KitchenStation {
  id: string;
  name: string;
  assignedOrders: string[];
  capacity: number;
  currentLoad: number;
  status: 'active' | 'busy' | 'offline';
}

const KitchenDisplaySystem = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' }
  ];

  const getCurrentFilterLabel = () => {
    return filterOptions.find(f => f.value === activeFilter)?.label || 'All Orders';
  };

  // Initialize with sample data
  useEffect(() => {
    const sampleOrders: KitchenOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        customerName: 'John Smith',
        tableNumber: 'T5',
        orderType: 'dine-in',
        items: [
          { id: '1', name: 'Classic Burger', quantity: 2, status: 'preparing', prepTime: 15, startTime: new Date(Date.now() - 5 * 60000) },
          { id: '2', name: 'French Fries', quantity: 2, status: 'preparing', prepTime: 8, startTime: new Date(Date.now() - 5 * 60000) },
          { id: '3', name: 'Caesar Salad', quantity: 1, status: 'pending', prepTime: 10 }
        ],
        orderTime: new Date(Date.now() - 10 * 60000),
        status: 'preparing',
        priority: 'normal',
        estimatedTime: 20,
        specialInstructions: 'Extra pickles on the side'
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        customerName: 'Sarah Johnson',
        orderType: 'takeout',
        items: [
          { id: '4', name: 'Margherita Pizza', quantity: 1, status: 'pending', prepTime: 20 },
          { id: '5', name: 'Garlic Bread', quantity: 1, status: 'pending', prepTime: 5 }
        ],
        orderTime: new Date(Date.now() - 5 * 60000),
        status: 'pending',
        priority: 'high',
        estimatedTime: 25
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        customerName: 'Mike Wilson',
        tableNumber: 'T3',
        orderType: 'dine-in',
        items: [
          { id: '6', name: 'Grilled Salmon', quantity: 1, status: 'ready', prepTime: 18, startTime: new Date(Date.now() - 18 * 60000) },
          { id: '7', name: 'Steak Medium', quantity: 1, status: 'ready', prepTime: 25, startTime: new Date(Date.now() - 25 * 60000) }
        ],
        orderTime: new Date(Date.now() - 30 * 60000),
        status: 'ready',
        priority: 'normal',
        estimatedTime: 25,
        actualTime: 18
      }
    ];

    const sampleStations: KitchenStation[] = [
      { id: '1', name: 'Grill Station', assignedOrders: ['1'], capacity: 3, currentLoad: 1, status: 'active' },
      { id: '2', name: 'Fry Station', assignedOrders: ['1'], capacity: 2, currentLoad: 1, status: 'active' },
      { id: '3', name: 'Pizza Station', assignedOrders: ['2'], capacity: 2, currentLoad: 1, status: 'busy' },
      { id: '4', name: 'Salad Station', assignedOrders: [], capacity: 1, currentLoad: 0, status: 'active' }
    ];

    setOrders(sampleOrders);
    setStations(sampleStations);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getOrderStatusColor = (status: KitchenOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: KitchenOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getItemStatusColor = (status: KitchenOrderItem['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateElapsedTime = (startTime?: Date) => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime.getTime()) / 60000);
  };

  const calculateProgress = (item: KitchenOrderItem) => {
    if (!item.prepTime || !item.startTime) return 0;
    const elapsed = calculateElapsedTime(item.startTime);
    return Math.min((elapsed / item.prepTime) * 100, 100);
  };

  const updateItemStatus = (orderId: string, itemId: string, status: KitchenOrderItem['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => 
          item.id === itemId ? { ...item, status, startTime: status === 'preparing' ? new Date() : item.startTime } : item
        );
        
        // Update order status based on item statuses
        const allItemsReady = updatedItems.every(item => item.status === 'ready' || item.status === 'completed');
        const anyItemPreparing = updatedItems.some(item => item.status === 'preparing');
        const allItemsCompleted = updatedItems.every(item => item.status === 'completed');
        
        let newOrderStatus: KitchenOrder['status'] = order.status;
        if (allItemsCompleted) newOrderStatus = 'completed';
        else if (allItemsReady) newOrderStatus = 'ready';
        else if (anyItemPreparing) newOrderStatus = 'preparing';
        
        return { ...order, items: updatedItems, status: newOrderStatus };
      }
      return order;
    }));
    
    toast.success('Item status updated');
  };

  const updateOrderStatus = (orderId: string, status: KitchenOrder['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    toast.success(`Order ${orderId} marked as ${status}`);
  };

  const getFilteredOrders = () => {
    if (activeFilter === 'all') return orders;
    return orders.filter(order => order.status === activeFilter);
  };

  const getKitchenStats = () => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const urgent = orders.filter(o => o.priority === 'urgent').length;
    
    return { pending, preparing, ready, completed, urgent };
  };

  const stats = getKitchenStats();

  return (
    <div className="space-y-6">
      {/* Kitchen Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChefHat className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.preparing}</p>
              <p className="text-sm text-muted-foreground">Preparing</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
              <p className="text-sm text-muted-foreground">Ready</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Kitchen Stations Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Kitchen Stations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stations.map((station) => (
              <div key={station.id} className={`p-3 rounded-lg border ${
                station.status === 'active' ? 'bg-green-50 border-green-200' :
                station.status === 'busy' ? 'bg-yellow-50 border-yellow-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{station.name}</span>
                  <Badge variant={station.status === 'active' ? 'default' : 'secondary'}>
                    {station.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Load: {station.currentLoad}/{station.capacity}
                </div>
                <Progress 
                  value={(station.currentLoad / station.capacity) * 100} 
                  className="mt-2 h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      {/* Mobile Filter Dropdown */}
      <div className="md:hidden">
        <div className="relative">
          <button
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-accent"
          >
            <span>{getCurrentFilterLabel()}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {filterDropdownOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
              <div className="max-h-64 overflow-y-auto">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setActiveFilter(option.value as any); setFilterDropdownOpen(false); }}
                    className={`flex w-full items-center rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-accent ${
                      activeFilter === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Filter Tabs */}
      <div className="hidden md:flex gap-2">
        {(['all', 'pending', 'preparing', 'ready'] as const).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter)}
            className="capitalize"
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Orders Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredOrders().map((order) => (
          <Card key={order.id} className={`border-2 ${getOrderStatusColor(order.status)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{order.orderNumber}</span>
                  <Badge className={getPriorityColor(order.priority)}>
                    {order.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {order.orderType}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.orderTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>{order.customerName}</span>
                {order.tableNumber && (
                  <>
                    <span>•</span>
                    <span>Table {order.tableNumber}</span>
                  </>
                )}
              </div>
              {order.specialInstructions && (
                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  {order.specialInstructions}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.quantity}x {item.name}</span>
                      <Badge className={getItemStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                    )}
                    {item.status === 'preparing' && item.prepTime && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Prep Time</span>
                          <span>{calculateElapsedTime(item.startTime)}/{item.prepTime} min</span>
                        </div>
                        <Progress value={calculateProgress(item)} className="h-2" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {item.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateItemStatus(order.id, item.id, 'preparing')}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {item.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateItemStatus(order.id, item.id, 'ready')}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    {item.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => updateItemStatus(order.id, item.id, 'completed')}
                      >
                        <Package className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Order
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Order {order.orderNumber} Details</DialogTitle>
                    </DialogHeader>
                    <OrderDetails order={order} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {getFilteredOrders().length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No orders in {activeFilter} status</p>
        </div>
      )}
    </div>
  );
};

// Order Details Component
const OrderDetails = ({ order }: { order: KitchenOrder }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Customer</p>
          <p>{order.customerName}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Order Type</p>
          <p>{order.orderType}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Table</p>
          <p>{order.tableNumber || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Priority</p>
          <Badge>{order.priority}</Badge>
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">Items</p>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{item.quantity}x {item.name}</span>
                {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
              </div>
              <Badge>{item.status}</Badge>
            </div>
          ))}
        </div>
      </div>
      
      {order.specialInstructions && (
        <div>
          <p className="text-sm font-medium mb-1">Special Instructions</p>
          <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">{order.specialInstructions}</p>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplaySystem;
