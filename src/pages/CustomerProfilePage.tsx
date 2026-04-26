import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContextFirebase'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { useCustomerOrders } from '@/hooks/useRealtimeOrders'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, MapPin, Package, Award, Settings, LogOut, 
  Calendar, Phone, Mail, ChevronRight, History, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

const CustomerProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { profile, updateProfile, addAddress } = useCustomerProfile()
  const { orders } = useCustomerOrders(user?.name)
  
  // Redirect admin users to admin profile
  useEffect(() => {
    if (user?.role === 'admin') {
      window.location.href = '/admin-profile'
    }
  }, [user])
  
  const [isEditing, setIsEditing] = useState(false)
  const [newAddress, setNewAddress] = useState('')
  const [editForm, setEditForm] = useState({
    phone: '',
    name: ''
  })
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null)
  const [editingAddressValue, setEditingAddressValue] = useState('')
  const [notifSettings, setNotifSettings] = useState({
    orderUpdates: true,
    promotionalOffers: true,
    loyaltyUpdates: false
  })
  const [privacySettings, setPrivacySettings] = useState({
    shareOrderHistory: false,
    personalizedRecommendations: true
  })

  const customerTabs = [
    { value: 'overview', label: 'Overview', icon: User },
    { value: 'orders', label: 'Order History', icon: History },
    { value: 'addresses', label: 'Addresses', icon: MapPin },
    { value: 'rewards', label: 'Rewards', icon: Award },
    { value: 'settings', label: 'Settings', icon: Settings }
  ]

  const getCurrentTabInfo = () => {
    return customerTabs.find(tab => tab.value === activeTab) || customerTabs[0]
  }

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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-6">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto">
                <User size={48} />
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-4 pt-4 border-t flex items-center justify-around">
              <div className="text-center">
                <p className="text-xl font-bold text-orange-600">{profile.loyaltyPoints}</p>
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
              {([
                { value: 'overview', label: 'Profile Overview', icon: User },
                { value: 'orders', label: 'Order History', icon: History },
                { value: 'addresses', label: 'My Addresses', icon: MapPin },
                { value: 'rewards', label: 'Rewards', icon: Award },
                { value: 'settings', label: 'Settings', icon: Settings },
              ] as const).map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant="ghost"
                  className={`w-full justify-start ${activeTab === value ? 'text-orange-600 bg-orange-50' : ''}`}
                  onClick={() => setActiveTab(value)}
                >
                  <Icon className="h-4 w-4 mr-3" /> {label}
                </Button>
              ))}
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
                      {customerTabs.map(tab => {
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
            <TabsList className="hidden md:grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Profile Details */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your account details</CardDescription>
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
                          <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                          <p className="mt-1">{new Date(profile.memberSince).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Statistics</CardTitle>
                  <CardDescription>Your activity and rewards overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">{profile.loyaltyPoints}</p>
                      <p className="text-sm text-muted-foreground">Loyalty Points</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{profile.totalOrders}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{profile.addresses?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Saved Addresses</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.floor((new Date().getTime() - new Date(profile.memberSince).getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-sm text-muted-foreground">Days Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest orders and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Order #{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                            <p className="text-sm font-medium mt-1">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => window.location.href = '/orders'}>
                        View All Orders
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center -py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No orders yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/'}>
                        Start Ordering
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>Your complete order history with detailed tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">Order #{order.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                              <p className="text-lg font-bold mt-1">${order.total.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <p className="text-sm font-medium">Items:</p>
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {order.deliveryAddress}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.location.href = `/track/${order.id}`}>
                              Track Order
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center -py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No orders yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/'}>
                        Start Ordering
                      </Button>
                    </div>
                  )}
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
                    <form onSubmit={handleAddAddress} className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Enter new address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" className="sm:flex-shrink-0">Add Address</Button>
                    </form>
                    
                    {profile.addresses && profile.addresses.length > 0 ? (
                      <div className="space-y-3">
                        {profile.addresses.map((address, index) => (
                          <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg sm:flex-row sm:items-center sm:justify-between">
                            {editingAddressIndex === index ? (
                              <div className="flex gap-2 flex-1">
                                <Input
                                  value={editingAddressValue}
                                  onChange={(e) => setEditingAddressValue(e.target.value)}
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button size="sm" onClick={() => {
                                  if (editingAddressValue.trim()) {
                                    const updated = [...profile.addresses];
                                    updated[index] = editingAddressValue.trim();
                                    updateProfile({ ...profile, addresses: updated });
                                    toast.success('Address updated');
                                  }
                                  setEditingAddressIndex(null);
                                  setEditingAddressValue('');
                                }}>Save</Button>
                                <Button size="sm" variant="outline" onClick={() => { setEditingAddressIndex(null); setEditingAddressValue(''); }}>Cancel</Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="break-words min-w-0">{address}</span>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button variant="outline" size="sm" onClick={() => { setEditingAddressIndex(index); setEditingAddressValue(address); }}>
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
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center -py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No addresses saved yet</p>
                        <p className="text-sm">Add your first delivery address above</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rewards & Loyalty</CardTitle>
                  <CardDescription>Your loyalty points and rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                      <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-orange-600">{profile.loyaltyPoints}</h3>
                      <p className="text-muted-foreground">Loyalty Points</p>
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Next reward at 500 points</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((profile.loyaltyPoints / 500) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Free Delivery</p>
                            <p className="text-sm text-muted-foreground">250 points</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Award className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">10% Off</p>
                            <p className="text-sm text-muted-foreground">500 points</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Notifications</h4>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Order updates</span>
                          <input type="checkbox" checked={notifSettings.orderUpdates} onChange={(e) => setNotifSettings(s => ({ ...s, orderUpdates: e.target.checked }))} className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Promotional offers</span>
                          <input type="checkbox" checked={notifSettings.promotionalOffers} onChange={(e) => setNotifSettings(s => ({ ...s, promotionalOffers: e.target.checked }))} className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Loyalty program updates</span>
                          <input type="checkbox" checked={notifSettings.loyaltyUpdates} onChange={(e) => setNotifSettings(s => ({ ...s, loyaltyUpdates: e.target.checked }))} className="rounded" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Privacy</h4>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Share order history</span>
                          <input type="checkbox" checked={privacySettings.shareOrderHistory} onChange={(e) => setPrivacySettings(s => ({ ...s, shareOrderHistory: e.target.checked }))} className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Personalized recommendations</span>
                          <input type="checkbox" checked={privacySettings.personalizedRecommendations} onChange={(e) => setPrivacySettings(s => ({ ...s, personalizedRecommendations: e.target.checked }))} className="rounded" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Account Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Your data export has been requested. You will receive an email shortly.')}
                        >
                          Download my data
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => toast.error('To delete your account, please contact support@bitebuzz.com')}>
                          Delete account
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

export default CustomerProfilePage;
