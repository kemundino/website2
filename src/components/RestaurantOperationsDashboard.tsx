import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Clock,
  Calendar, MapPin, ChefHat, AlertCircle, CheckCircle,
  Activity, BarChart3, PieChart, LineChart, Target,
  Zap, Award, Bell, Download, RefreshCw, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface OperationsMetrics {
  revenue: {
    today: number;
    week: number;
    month: number;
    growth: number;
    target: number;
    achievement: number;
  };
  customers: {
    today: number;
    week: number;
    month: number;
    new: number;
    returning: number;
    satisfaction: number;
  };
  orders: {
    today: number;
    week: number;
    month: number;
    averageValue: number;
    completionRate: number;
    preparationTime: number;
  };
  staff: {
    total: number;
    active: number;
    onDuty: number;
    efficiency: number;
    attendance: number;
  };
  tables: {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    turnoverRate: number;
  };
  kitchen: {
    ordersInProgress: number;
    averagePrepTime: number;
    completionRate: number;
    efficiency: number;
  };
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  time: Date;
  acknowledged: boolean;
}

interface PerformanceTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const RestaurantOperationsDashboard = () => {
  const [metrics, setMetrics] = useState<OperationsMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const getCurrentPeriodLabel = () => {
    return periodOptions.find(p => p.value === selectedPeriod)?.label || 'Today';
  };

  // Initialize with sample data
  useEffect(() => {
    const sampleMetrics: OperationsMetrics = {
      revenue: {
        today: 3456.78,
        week: 24567.89,
        month: 98234.56,
        growth: 12.5,
        target: 4000,
        achievement: 86.4
      },
      customers: {
        today: 67,
        week: 456,
        month: 1823,
        new: 23,
        returning: 44,
        satisfaction: 4.6
      },
      orders: {
        today: 89,
        week: 623,
        month: 2491,
        averageValue: 38.84,
        completionRate: 96.5,
        preparationTime: 18.5
      },
      staff: {
        total: 12,
        active: 10,
        onDuty: 8,
        efficiency: 87.3,
        attendance: 94.2
      },
      tables: {
        total: 12,
        available: 3,
        occupied: 6,
        reserved: 3,
        turnoverRate: 3.2
      },
      kitchen: {
        ordersInProgress: 12,
        averagePrepTime: 16.8,
        completionRate: 94.7,
        efficiency: 91.2
      }
    };

    const sampleAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Kitchen Load',
        message: 'Kitchen efficiency at 85% - Consider redistributing orders',
        time: new Date(Date.now() - 10 * 60 * 1000),
        acknowledged: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Revenue Target Achieved',
        message: 'Daily revenue target of $4000 exceeded by $456.78',
        time: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Staff Schedule Update',
        message: '2 additional staff members scheduled for evening shift',
        time: new Date(Date.now() - 45 * 60 * 1000),
        acknowledged: true
      }
    ];

    const sampleTrends: PerformanceTrend[] = [
      { metric: 'Revenue', current: 3456.78, previous: 3078.45, change: 12.3, trend: 'up' },
      { metric: 'Customers', current: 67, previous: 58, change: 15.5, trend: 'up' },
      { metric: 'Orders', current: 89, previous: 92, change: -3.3, trend: 'down' },
      { metric: 'Avg Order Value', current: 38.84, previous: 36.12, change: 7.5, trend: 'up' },
      { metric: 'Prep Time', current: 18.5, previous: 20.2, change: -8.4, trend: 'down' },
      { metric: 'Customer Satisfaction', current: 4.6, previous: 4.4, change: 4.5, trend: 'up' }
    ];

    setMetrics(sampleMetrics);
    setAlerts(sampleAlerts);
    setTrends(sampleTrends);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
      // In a real app, this would fetch fresh data
      toast.success('Dashboard updated');
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'info': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    toast.success('Alert acknowledged');
  };

  const getTrendIcon = (trend: PerformanceTrend['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPeriodData = () => {
    if (!metrics) return null;
    
    switch (selectedPeriod) {
      case 'today':
        return {
          revenue: metrics.revenue.today,
          customers: metrics.customers.today,
          orders: metrics.orders.today
        };
      case 'week':
        return {
          revenue: metrics.revenue.week,
          customers: metrics.customers.week,
          orders: metrics.orders.week
        };
      case 'month':
        return {
          revenue: metrics.revenue.month,
          customers: metrics.customers.month,
          orders: metrics.orders.month
        };
    }
  };

  const periodData = getPeriodData();

  if (!metrics || !periodData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Restaurant Operations</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Real-time performance metrics and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLastUpdated(new Date())} className="flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      {/* Mobile Period Dropdown */}
      <div className="md:hidden">
        <div className="relative">
          <button
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-accent"
          >
            <span>{getCurrentPeriodLabel()}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${periodDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {periodDropdownOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
              <div className="max-h-64 overflow-y-auto">
                {periodOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setSelectedPeriod(option.value as any); setPeriodDropdownOpen(false); }}
                    className={`flex w-full items-center rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-accent ${
                      selectedPeriod === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
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

      {/* Desktop Period Tabs */}
      <div className="hidden md:flex gap-2">
        {(['today', 'week', 'month'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod(period)}
            className="capitalize"
          >
            {period}
          </Button>
        ))}
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold">${periodData.revenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'This Month'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Target Achievement</span>
                <span className="text-sm font-medium">{metrics.revenue.achievement}%</span>
              </div>
              <Progress value={metrics.revenue.achievement} className="h-2" />
              <div className="flex items-center gap-2">
                {getTrendIcon(metrics.revenue.growth > 0 ? 'up' : 'down')}
                <span className="text-sm">
                  {metrics.revenue.growth > 0 ? '+' : ''}{metrics.revenue.growth}% growth
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold">{periodData.customers}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'This Month'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">New: </span>
                  <span className="font-medium">{metrics.customers.new}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Returning: </span>
                  <span className="font-medium">{metrics.customers.returning}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  {metrics.customers.satisfaction}⭐ satisfaction
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold">{periodData.orders}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'This Month'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Avg Value: </span>
                  <span className="font-medium">${metrics.orders.averageValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Complete: </span>
                  <span className="font-medium">{metrics.orders.completionRate}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">
                  {metrics.orders.preparationTime} min avg prep
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{metrics.staff.onDuty}</p>
                <p className="text-sm text-muted-foreground">On Duty</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.staff.total}</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Efficiency</span>
                <span>{metrics.staff.efficiency}%</span>
              </div>
              <Progress value={metrics.staff.efficiency} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attendance</span>
                <span>{metrics.staff.attendance}%</span>
              </div>
              <Progress value={metrics.staff.attendance} className="h-2" />
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-600">
                {metrics.staff.active} active
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                {metrics.staff.total - metrics.staff.active} off
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Table Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Table Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{metrics.tables.occupied}</p>
                <p className="text-sm text-muted-foreground">Occupied</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.tables.available}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">{metrics.tables.available} available</span>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">{metrics.tables.occupied} occupied</span>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">{metrics.tables.reserved} reserved</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Turnover Rate</span>
                <span>{metrics.tables.turnoverRate}/day</span>
              </div>
              <Progress value={(metrics.tables.turnoverRate / 5) * 100} className="h-2" />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {Math.round((metrics.tables.occupied / metrics.tables.total) * 100)}% occupancy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Kitchen Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{metrics.kitchen.ordersInProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.kitchen.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg Prep Time</span>
                <span>{metrics.kitchen.averagePrepTime} min</span>
              </div>
              <Progress value={(20 - metrics.kitchen.averagePrepTime) / 20 * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Efficiency</span>
                <span>{metrics.kitchen.efficiency}%</span>
              </div>
              <Progress value={metrics.kitchen.efficiency} className="h-2" />
            </div>
            
            <div className="flex gap-2">
              <Badge variant={metrics.kitchen.ordersInProgress > 10 ? "destructive" : "default"}>
                {metrics.kitchen.ordersInProgress > 10 ? 'High Load' : 'Normal Load'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{trend.metric}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {trend.current} {trend.metric.includes('$') ? '' : trend.metric.includes('⭐') ? '' : trend.metric.includes('min') ? 'min' : ''}
                  </p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(trend.trend)}
                    <span className={`text-sm font-medium ${
                      trend.trend === 'up' ? 'text-green-600' : 
                      trend.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs previous</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.filter(alert => !alert.acknowledged).map((alert) => (
              <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(alert.time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="w-full sm:w-auto"
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
            
            {alerts.filter(alert => !alert.acknowledged).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active alerts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantOperationsDashboard;
