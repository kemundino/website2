import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { useCustomerOrders } from '@/hooks/useRealtimeOrders'
import { useUnifiedItems } from '@/context/UnifiedItemsContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, MapPin, Package, Award, Settings, LogOut, 
  Calendar, Phone, Mail, ChevronRight, History,
  TrendingUp, Users, DollarSign, ShoppingCart,
  Activity, Database, Shield, Bell, Zap, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

const AdminProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { profile, updateProfile, addAddress } = useCustomerProfile()
  const { orders } = useCustomerOrders(user?.name)
  const { items } = useUnifiedItems()
  
  const [isEditing, setIsEditing] = useState(false)
  const [newAddress, setNewAddress] = useState('')
  const [editForm, setEditForm] = useState({
    phone: '',
    name: ''
  })
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const adminTabs = [
    { value: 'overview', label: 'Overview', icon: User },
    { value: 'analytics', label: 'Analytics', icon: TrendingUp },
    { value: 'orders', label: 'Orders', icon: ShoppingCart },
    { value: 'addresses', label: 'Addresses', icon: MapPin },
    { value: 'system', label: 'System', icon: Activity },
    { value: 'settings', label: 'Settings', icon: Settings }
  ]

  const getCurrentTabInfo = () => {
    return adminTabs.find(tab => tab.value === activeTab) || adminTabs[0]
  }

  // Calculate admin statistics
  const calculateAdminStats = () => {
    const allOrders = JSON.parse(localStorage.getItem('bitebuzz_orders') || '[]')
    const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + order.total, 0)
    const totalCustomers = new Set(allOrders.map((order: any) => order.customerName)).size
    const todayOrders = allOrders.filter((order: any) => 
      new Date(order.createdAt).toDateString() === new Date().toDateString()
    ).length
    
    return {
      totalRevenue,
      totalCustomers,
      totalOrders: allOrders.length,
      todayOrders,
      totalItems: items.length,
      activeItems: items.filter(item => item.tag === 'regular').length,
      customItems: items.filter(item => item.tag === 'custom').length
    }
  }

  const adminStats = calculateAdminStats()

  // Sync editForm with profile data once loaded
  useEffect(() => {
    if (profile) {
      setEditForm({
        phone: profile.phone || '',
        name: profile.name || ''
      })
    }
  }, [profile])

  // If we are definitely not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
        <Button onClick={() => window.location.href = '/auth'}>Sign In</Button>
      </div>
    )
  }

  // If authenticated but profile hasn't loaded yet, show loading
  if (!profile) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    )
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (updateProfile(editForm)) {
      toast.success('Profile updated successfully')
      setIsEditing(false)
    }
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAddress.trim()) {
      addAddress(newAddress.trim())
      setNewAddress('')
      toast.success('Address added')
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-6">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto">
                <Shield size={48} />
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-green-500 rounded-full border-2 border-white" />
              <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                ADMIN
              </div>
            </div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge className="mt-2 bg-purple-100 text-purple-700">Administrator</Badge>
            
            <div className="mt-4 pt-4 border-t flex items-center justify-around">
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">{profile.loyaltyPoints}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Points</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">{profile.totalOrders}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Orders</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6 text-destructive hover:text-destructive" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </Card>

          <Card className="p-4">
            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-purple-600 bg-purple-50">
                <User className="h-4 w-4 mr-3" /> Admin Overview
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-3" /> Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <History className="h-4 w-4 mr-3" /> Order History
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-3" /> My Addresses
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-3" /> System Health
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-3" /> Admin Settings
              </Button>
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Mobile Tab Dropdown */}
            <div className="md:hidden">
              <div className="relative">
                <button
                  onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const Icon = getCurrentTabInfo().icon
                      return <Icon className="h-4 w-4" />
                    })()}
                    {getCurrentTabInfo().label}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileDropdownOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                    <div className="max-h-64 overflow-y-auto">
                      {adminTabs.map(tab => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.value}
                            onClick={() => { setActiveTab(tab.value); setMobileDropdownOpen(false); }}
                            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-accent ${
                              activeTab === tab.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Tab List */}
            <TabsList className="hidden md:grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Admin Profile Details */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Administrator Profile</CardTitle>
                    <CardDescription>Manage your admin account details</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Save Changes</Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                          <p className="mt-1">{profile.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                          <p className="mt-1">{profile.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                          <p className="mt-1">{profile.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Admin Since</Label>
                          <p className="mt-1">{new Date(profile.memberSince).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Overview</CardTitle>
                  <CardDescription>Your restaurant's key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">${adminStats.totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{adminStats.totalCustomers}</p>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <ShoppingCart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">{adminStats.totalOrders}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">{adminStats.totalItems}</p>
                      <p className="text-sm text-muted-foreground">Menu Items</p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <Zap className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-pink-600">{adminStats.todayOrders}</p>
                      <p className="text-sm text-muted-foreground">Today's Orders</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-indigo-600">{adminStats.activeItems}</p>
                      <p className="text-sm text-muted-foreground">Active Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col" onClick={() => window.location.href = '/admin'}>
                      <Package className="h-6 w-6 mb-2" />
                      Manage Menu
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => window.location.href = '/admin'}>
                      <Users className="h-6 w-6 mb-2" />
                      View Orders
                    </Button>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => window.location.href = '/admin'}>
                      <TrendingUp className="h-6 w-6 mb-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Analytics</CardTitle>
                  <CardDescription>Detailed insights into your restaurant performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Revenue Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Today</span>
                            <span className="font-medium">$0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>This Week</span>
                            <span className="font-medium">$0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>This Month</span>
                            <span className="font-medium">${adminStats.totalRevenue.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Customer Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Customers</span>
                            <span className="font-medium">{adminStats.totalCustomers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>New Customers (Today)</span>
                            <span className="font-medium">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Order Value</span>
                            <span className="font-medium">
                              ${adminStats.totalOrders > 0 ? (adminStats.totalRevenue / adminStats.totalOrders).toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>View and manage all customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={() => window.location.href = '/admin'}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Go to Order Management
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Total orders in system: {adminStats.totalOrders}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Addresses</CardTitle>
                  <CardDescription>Manage your delivery addresses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <form onSubmit={handleAddAddress} className="flex gap-2">
                      <Input
                        placeholder="Enter new address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit">Add Address</Button>
                    </form>
                    
                    {profile.addresses && profile.addresses.length > 0 ? (
                      <div className="space-y-3">
                        {profile.addresses.map((address, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{address}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  const updatedAddresses = profile.addresses.filter((_, i) => i !== index);
                                  updateProfile({ ...profile, addresses: updatedAddresses });
                                  toast.success('Address removed');
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No addresses saved yet</p>
                        <p className="text-sm">Add your first delivery address above</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Monitor system performance and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Database Status</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Orders</span>
                            <Badge variant="outline" className="text-green-600">
                              <Activity className="h-3 w-3 mr-1" />
                              {adminStats.totalOrders} records
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Menu Items</span>
                            <Badge variant="outline" className="text-green-600">
                              <Activity className="h-3 w-3 mr-1" />
                              {adminStats.totalItems} items
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Customers</span>
                            <Badge variant="outline" className="text-green-600">
                              <Activity className="h-3 w-3 mr-1" />
                              {adminStats.totalCustomers} customers
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">System Performance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Storage</span>
                            <Badge variant="outline" className="text-green-600">
                              <Database className="h-3 w-3 mr-1" />
                              Local Storage
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Status</span>
                            <Badge variant="outline" className="text-green-600">
                              <Activity className="h-3 w-3 mr-1" />
                              Operational
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Updated</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>Configure your administrative preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Notifications</h4>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">New order alerts</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Low inventory alerts</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Customer feedback alerts</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">System Preferences</h4>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Auto-refresh dashboard</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Show detailed analytics</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Enable debug mode</span>
                          <input type="checkbox" className="rounded" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Admin Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Database className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Security Settings
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                          <Activity className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
