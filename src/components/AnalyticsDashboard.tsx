import { useMemo } from 'react'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { useReviews } from '@/hooks/useReviews'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { DollarSign, ShoppingBag, Users, TrendingUp, Clock, Star, MessageSquare } from 'lucide-react'

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']

const AnalyticsDashboard = () => {
  const { orders } = useRealtimeOrders()
  const { reviews } = useReviews()

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    const completedOrders = orders.filter(o => o.status === 'delivered').length
    const activeOrders = orders.filter(o => o.status !== 'delivered').length
    
    // Revenue by Day
    const revenueByDay = orders.reduce((acc: any, order) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' })
      acc[date] = (acc[date] || 0) + order.total
      return acc
    }, {})

    const revenueChartData = Object.keys(revenueByDay).map(day => ({
      name: day,
      revenue: revenueByDay[day]
    }))

    // Popular Items
    const itemCounts = orders.reduce((acc: any, order) => {
      order.items.forEach(item => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity
      })
      return acc
    }, {})

    const popularItemsData = Object.keys(itemCounts)
      .map(name => ({ name, value: itemCounts[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Order Status Breakdown
    const statusCounts = orders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})

    const statusData = Object.keys(statusCounts).map(status => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: statusCounts[status]
    }))

    return {
      totalRevenue,
      avgOrderValue,
      completedOrders,
      activeOrders,
      revenueChartData,
      popularItemsData,
      statusData
    }
  }, [orders])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">${stats.totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12.5% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{orders.length}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-blue-600">
              <Clock className="h-3 w-3 mr-1" />
              <span>{stats.activeOrders} currently active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                <h3 className="text-2xl font-bold mt-1">${stats.avgOrderValue.toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <span>Based on {orders.length} orders</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h3 className="text-2xl font-bold mt-1">{stats.completedOrders}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-purple-600">
              <span>{((stats.completedOrders / (orders.length || 1)) * 100).toFixed(1)}% success rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Analysis</CardTitle>
            <CardDescription>Daily revenue trends for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Items Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Popular Dishes</CardTitle>
            <CardDescription>Top 5 most ordered items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.popularItemsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20}>
                    {stats.popularItemsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Order Distribution</CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {stats.statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div className="min-w-0">
                    <span className="text-xs font-medium block truncate">{entry.name}</span>
                    <span className="text-xs text-muted-foreground">{entry.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Efficiency Insights</CardTitle>
            <CardDescription>Real-time performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Avg. Prep Time</p>
                  <p className="text-xs text-muted-foreground">Minutes per order</p>
                </div>
              </div>
              <p className="text-xl font-bold">18m</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Customer Rating</p>
                  <p className="text-xs text-muted-foreground">Recent feedback</p>
                </div>
              </div>
              <p className="text-xl font-bold">4.8/5</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Repeat Customers</p>
                  <p className="text-xs text-muted-foreground">Order frequency</p>
                </div>
              </div>
              <p className="text-xl font-bold">65%</p>
            </div>
          </CardContent>
        </Card>
        {/* Recent Reviews */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Customer Reviews</CardTitle>
                <CardDescription>Latest feedback from your customers</CardDescription>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.slice(0, 6).map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{review.customerName}</span>
                      <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 italic">"{review.comment}"</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs font-medium text-orange-600">Order #{review.orderId}</span>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  No reviews yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
