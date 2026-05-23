import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContextFirebase'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
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
  Activity, Database, Shield, Bell, Zap, ChevronDown,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const AdminProfilePage = ({ onTabChange }: { onTabChange?: (tab: string) => void }) => {
  const { logout, isAuthenticated } = useAuth()
  const { profile, updateProfile, addAddress } = useCustomerProfile()
  const { orders: systemOrders } = useRealtimeOrders()
  const { items } = useUnifiedItems()
  
  const [isEditing, setIsEditing] = useState(false)
  const [newAddress, setNewAddress] = useState('')
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    phone: '',
    name: '',
    avatar: '',
    bio: ''
  })
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const adminTabs = [
    { value: 'overview', label: 'Admin Overview', icon: User },
    { value: 'analytics', label: 'Analytics', icon: TrendingUp },
    { value: 'orders', label: 'Order History', icon: History },
    { value: 'addresses', label: 'My Addresses', icon: MapPin },
    { value: 'system', label: 'System Health', icon: Activity },
    { value: 'settings', label: 'Admin Settings', icon: Settings }
  ]

  const getCurrentTabInfo = () => {
    return adminTabs.find(tab => tab.value === activeTab) || adminTabs[0]
  }

  // Calculate admin statistics
  const calculateAdminStats = () => {
    const allOrders = systemOrders
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0)
    const totalCustomers = new Set(allOrders.map((order) => order.customerName)).size
    const todayOrders = allOrders.filter((order) => 
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

  useEffect(() => {
    if (profile) {
      setEditForm({
        phone: profile.phone || '',
        name: profile.name || '',
        avatar: profile.avatar || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 font-display">Please sign in to view your profile</h2>
        <Button className="rounded-xl px-8" onClick={() => window.location.href = '/auth'}>Sign In</Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground font-medium">Initializing Admin Profile...</p>
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
    if (!newAddress.trim()) return

    if (editingAddressIndex !== null) {
      const updatedAddresses = [...(profile.addresses || [])]
      updatedAddresses[editingAddressIndex] = newAddress.trim()
      updateProfile({ ...profile, addresses: updatedAddresses })
      setEditingAddressIndex(null)
      toast.success('Address updated')
    } else {
      addAddress(newAddress.trim())
      toast.success('Address added')
    }
    setNewAddress('')
  }

  const handleEditAddress = (index: number) => {
    setNewAddress(profile.addresses[index])
    setEditingAddressIndex(index)
    // Scroll to input if needed or just focus
    const input = document.getElementById('address-input')
    input?.focus()
  }

  const handleSettingsAction = (action: string) => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: `Executing ${action}...`,
      success: `${action} completed successfully`,
      error: `Failed to execute ${action}`
    })
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="text-center p-8 border-none shadow-xl rounded-[2rem] bg-white dark:bg-card overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-primary" />
            <div className="relative inline-block mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white dark:text-background mx-auto shadow-lg border-4 border-white overflow-hidden bg-white dark:bg-card">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <Shield size={56} className="text-primary" />
                )}
              </div>
              <div className="absolute bottom-1 right-1 p-2 bg-green-500 rounded-full border-4 border-white shadow-sm" />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-4 bg-primary text-white dark:text-background text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-tighter"
              >
                Root Admin
              </motion.div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-foreground font-display tracking-tight">{profile.name}</h2>
            <p className="text-sm text-slate-400 dark:text-muted-foreground/80 font-medium mb-2">{profile.email}</p>
            {profile.bio && (
              <p className="text-xs text-slate-500 dark:text-muted-foreground italic mb-4 px-4 leading-relaxed line-clamp-2">"{profile.bio}"</p>
            )}
            
            <Button 
              variant="link" 
              className="text-xs font-black uppercase tracking-widest text-primary mb-2 hover:no-underline"
              onClick={() => { setActiveTab('overview'); setIsEditing(true); }}
            >
              Edit Identity Details
            </Button>
            
            <div className="flex justify-center gap-2 mb-8">
              <Badge className="bg-slate-100 dark:bg-muted text-slate-700 dark:text-foreground/90 border-none px-4 py-1.5 rounded-xl font-bold">
                Level 99
              </Badge>
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-xl font-bold">
                Certified
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-border/50">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-foreground">{profile.loyaltyPoints}</p>
                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-muted-foreground/80 tracking-widest">Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-foreground">{adminStats.totalOrders}</p>
                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-muted-foreground/80 tracking-widest">Orders</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-10 h-14 rounded-2xl font-bold text-destructive hover:text-white dark:text-background hover:bg-destructive transition-all border-slate-200 dark:border-border" 
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-3" /> Logout Account
            </Button>
          </Card>

          <Card className="p-3 border-none shadow-lg rounded-[2rem] bg-white dark:bg-card hidden lg:block">
            <nav className="space-y-1">
              {adminTabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.value
                return (
                  <Button 
                    key={tab.value}
                    variant="ghost" 
                    onClick={() => setActiveTab(tab.value)}
                    className={`w-full justify-start h-14 rounded-xl font-bold transition-all ${
                      isActive 
                        ? "bg-primary text-white dark:text-background shadow-lg shadow-primary/20 scale-[1.02]" 
                        : "text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:bg-background hover:text-slate-900 dark:text-foreground"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-4 ${isActive ? "text-white dark:text-background" : "text-slate-400 dark:text-muted-foreground/80"}`} />
                    {tab.label}
                  </Button>
                )
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Mobile Tab Dropdown */}
            <div className="lg:hidden mb-6">
              <div className="relative">
                <button
                  onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card px-6 py-5 text-left font-bold text-slate-900 dark:text-foreground shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    {(() => {
                      const Icon = getCurrentTabInfo().icon
                      return <Icon className="h-5 w-5 text-primary" />
                    })()}
                    {getCurrentTabInfo().label}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 dark:text-muted-foreground/80 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {mobileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 z-50 mt-2 w-full rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-2 shadow-2xl"
                    >
                      <div className="max-h-80 overflow-y-auto space-y-1">
                        {adminTabs.map(tab => {
                          const Icon = tab.icon
                          return (
                            <button
                              key={tab.value}
                              onClick={() => { setActiveTab(tab.value); setMobileDropdownOpen(false); }}
                              className={`flex w-full items-center gap-3 rounded-xl px-5 py-4 text-left font-bold transition-all ${
                                activeTab === tab.value ? "bg-primary text-white dark:text-background" : "text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:bg-background"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{tab.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-8 mt-0 outline-none">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-card overflow-hidden">
                <CardHeader className="p-8 md:p-10 flex flex-row items-center justify-between border-b border-slate-50">
                  <div>
                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-foreground font-display">Administrative Identity</CardTitle>
                    <CardDescription className="text-md text-slate-400 dark:text-muted-foreground/80 font-medium mt-1">Configure your master account credentials</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-12 px-6 font-bold border-slate-200 dark:border-border hover:bg-slate-50 dark:bg-background shadow-sm transition-all active:scale-95"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Discard Changes' : 'Update Profile'}
                  </Button>
                </CardHeader>
                <CardContent className="p-8 md:p-10">
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-black text-slate-700 dark:text-foreground/90 ml-1">Display Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="h-14 rounded-2xl bg-slate-50 dark:bg-background border-slate-200 dark:border-border px-6 font-bold focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-black text-slate-700 dark:text-foreground/90 ml-1">Direct Line</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="h-14 rounded-2xl bg-slate-50 dark:bg-background border-slate-200 dark:border-border px-6 font-bold focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="avatar" className="text-sm font-black text-slate-700 dark:text-foreground/90 ml-1">Avatar Image URL</Label>
                          <Input
                            id="avatar"
                            value={editForm.avatar}
                            onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                            className="h-14 rounded-2xl bg-slate-50 dark:bg-background border-slate-200 dark:border-border px-6 font-bold focus:ring-primary/20"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio" className="text-sm font-black text-slate-700 dark:text-foreground/90 ml-1">Professional Bio</Label>
                          <textarea
                            id="bio"
                            value={editForm.bio}
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            className="w-full min-h-[100px] p-6 rounded-2xl bg-slate-50 dark:bg-background border-slate-200 dark:border-border font-bold focus:ring-primary/20 outline-none transition-all"
                            placeholder="Describe your administrative ethos..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button type="submit" className="h-14 px-10 rounded-2xl font-black text-md shadow-lg shadow-primary/20">Commit Changes</Button>
                        <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-bold" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-widest ml-1">Full Legal Name</Label>
                        <p className="text-xl font-bold text-slate-800 dark:text-foreground px-1">{profile.name}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-widest ml-1">Verified Email</Label>
                        <p className="text-xl font-bold text-slate-800 dark:text-foreground px-1">{profile.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-widest ml-1">Contact Phone</Label>
                        <p className="text-xl font-bold text-slate-800 dark:text-foreground px-1">{profile.phone || '— Unlisted —'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/80 uppercase tracking-widest ml-1">Privilege Since</Label>
                        <p className="text-xl font-bold text-slate-800 dark:text-foreground px-1">{new Date(profile.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button 
                  variant="outline" 
                  className="h-32 flex-col rounded-3xl bg-white dark:bg-card border-none shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all group" 
                  onClick={() => onTabChange ? onTabChange('regular-items') : (window.location.href = '/admin')}
                >
                  <Package className="h-8 w-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-black text-slate-800 dark:text-foreground text-sm sm:text-base">Menu Engine</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-32 flex-col rounded-3xl bg-white dark:bg-card border-none shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all group" 
                  onClick={() => onTabChange ? onTabChange('orders') : setActiveTab('orders')}
                >
                  <History className="h-8 w-8 mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-slate-800 dark:text-foreground text-sm sm:text-base">Order Logs</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-32 flex-col rounded-3xl bg-white dark:bg-card border-none shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all group" 
                  onClick={() => onTabChange ? onTabChange('analytics') : setActiveTab('analytics')}
                >
                  <TrendingUp className="h-8 w-8 mb-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="font-black text-slate-800 dark:text-foreground text-sm sm:text-base">Visual Insights</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-0 outline-none">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-card p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                    <TrendingUp size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-foreground font-display">Performance Metrics</h3>
                    <p className="text-slate-400 dark:text-muted-foreground/80 font-medium">Real-time business data processing</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6 p-8 rounded-[2rem] bg-slate-50 dark:bg-background border border-slate-100 dark:border-border/50">
                    <h4 className="font-black text-slate-800 dark:text-foreground text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-500" /> Revenue Flow
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white dark:bg-card p-4 rounded-xl shadow-sm">
                        <span className="font-bold text-slate-500 dark:text-muted-foreground">Gross Lifetime</span>
                        <span className="font-black text-xl text-emerald-600">${adminStats.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-card p-4 rounded-xl shadow-sm">
                        <span className="font-bold text-slate-500 dark:text-muted-foreground">Daily Average</span>
                        <span className="font-black text-xl text-slate-800 dark:text-foreground">${(adminStats.totalRevenue / Math.max(1, adminStats.totalOrders)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6 p-8 rounded-[2rem] bg-slate-50 dark:bg-background border border-slate-100 dark:border-border/50">
                    <h4 className="font-black text-slate-800 dark:text-foreground text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" /> User Impact
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white dark:bg-card p-4 rounded-xl shadow-sm">
                        <span className="font-bold text-slate-500 dark:text-muted-foreground">Unique Patrons</span>
                        <span className="font-black text-xl text-blue-600">{adminStats.totalCustomers}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-card p-4 rounded-xl shadow-sm">
                        <span className="font-bold text-slate-500 dark:text-muted-foreground">Order Frequency</span>
                        <span className="font-black text-xl text-slate-800 dark:text-foreground">{(adminStats.totalOrders / Math.max(1, adminStats.totalCustomers)).toFixed(1)}x</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6 mt-0 outline-none">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-card p-10 text-center">
                <div className="max-w-md mx-auto py-10">
                  <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <ShoppingCart size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-foreground font-display mb-4">Centralized Order Hub</h3>
                  <p className="text-slate-500 dark:text-muted-foreground font-medium mb-10">Access high-level logs and real-time processing tools in the main dashboard.</p>
                  <Button 
                    className="w-full h-14 sm:h-16 rounded-2xl font-black text-sm sm:text-lg shadow-xl shadow-primary/20" 
                    onClick={() => onTabChange ? onTabChange('analytics') : (window.location.href = '/admin')}
                  >
                    Open Live Command Center
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-6 mt-0 outline-none">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-card p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-foreground font-display">Logistics Hub</h3>
                    <p className="text-slate-400 dark:text-muted-foreground/80 font-medium">Manage your verified delivery locations</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <form onSubmit={handleAddAddress} className="flex flex-col sm:flex-row gap-4">
                    <Input
                      id="address-input"
                      placeholder={editingAddressIndex !== null ? "Modify address..." : "Enter a new secure location..."}
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="flex-1 h-16 rounded-2xl bg-slate-50 dark:bg-background border-slate-200 dark:border-border px-6 font-bold"
                    />
                    <Button type="submit" className="h-16 px-10 rounded-2xl font-black text-md">
                      {editingAddressIndex !== null ? "Commit Update" : "Secure Address"}
                    </Button>
                  </form>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {profile.addresses && profile.addresses.length > 0 ? (
                      profile.addresses.map((address, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white dark:bg-card border border-slate-100 dark:border-border/50 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-background rounded-2xl flex items-center justify-center text-slate-400 dark:text-muted-foreground/80 group-hover:text-primary transition-colors">
                              <MapPin size={24} />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-foreground/90 text-lg">{address}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              className="h-12 rounded-xl font-bold text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:bg-background"
                              onClick={() => handleEditAddress(index)}
                            >
                              Modify
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="h-12 rounded-xl font-bold text-destructive hover:bg-destructive/5"
                              onClick={() => {
                                const updatedAddresses = profile.addresses.filter((_, i) => i !== index);
                                updateProfile({ ...profile, addresses: updatedAddresses });
                                toast.success('Location scrubbed');
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-slate-50 dark:bg-background rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-border">
                        <MapPin className="h-16 w-16 mx-auto mb-4 text-slate-300 opacity-50" />
                        <h4 className="text-xl font-black text-slate-400 dark:text-muted-foreground/80">No Verified Locations</h4>
                        <p className="text-sm text-slate-400 dark:text-muted-foreground/80 mt-2">Initialize your logistics by adding a delivery point above.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6 mt-0 outline-none">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-card p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                    <Activity size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-foreground font-display">System Integrity</h3>
                    <p className="text-slate-400 dark:text-muted-foreground/80 font-medium">Core infrastructure monitoring</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8 p-8 rounded-[2rem] bg-slate-900 dark:bg-foreground text-white dark:text-background shadow-2xl">
                    <h4 className="font-black text-lg flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-400" /> Data Nodes
                    </h4>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-slate-400 dark:text-muted-foreground/80 font-bold">Transaction Records</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-none font-black">{adminStats.totalOrders}</Badge>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-slate-400 dark:text-muted-foreground/80 font-bold">Culinary Assets</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-none font-black">{adminStats.totalItems}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-muted-foreground/80 font-bold">Authorized Entities</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-none font-black">{adminStats.totalCustomers}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8 p-8 rounded-[2rem] bg-white dark:bg-card border border-slate-100 dark:border-border/50 shadow-lg">
                    <h4 className="font-black text-slate-800 dark:text-foreground text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" /> Active Status
                    </h4>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500 dark:text-muted-foreground">Main API</span>
                        <Badge className="bg-green-100 text-green-600 border-none font-black flex items-center gap-2 px-4 py-1.5 rounded-full animate-pulse">
                          <Activity className="h-3 w-3" /> Operational
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500 dark:text-muted-foreground">Auth Engine</span>
                        <Badge className="bg-green-100 text-green-600 border-none font-black px-4 py-1.5 rounded-full">Secure</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500 dark:text-muted-foreground">Latency</span>
                        <span className="font-black text-slate-900 dark:text-foreground">14ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-0 outline-none">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-card p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-slate-900 dark:bg-foreground rounded-2xl text-white dark:text-background">
                    <Settings size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-foreground font-display">Admin Preferences</h3>
                    <p className="text-slate-400 dark:text-muted-foreground/80 font-medium">Control system-wide behaviors</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-foreground mb-6 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" /> Intelligence Feed
                      </h4>
                      <div className="space-y-6 bg-slate-50 dark:bg-background p-6 rounded-3xl">
                        {[
                          "Real-time order interrupts",
                          "Inventory exhaustion alerts",
                          "High-priority feedback pings"
                        ].map((label, i) => (
                          <label key={i} className="flex items-center justify-between group cursor-pointer">
                            <span className="font-bold text-slate-600 dark:text-muted-foreground group-hover:text-slate-900 dark:text-foreground transition-colors">{label}</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white dark:bg-card after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="font-black text-slate-800 dark:text-foreground mb-6 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" /> Security & Maintenance
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-16 justify-start px-8 rounded-2xl font-black text-slate-700 dark:text-foreground/90 border-slate-200 dark:border-border hover:bg-slate-50 dark:bg-background transition-all shadow-sm"
                        onClick={() => handleSettingsAction('Data Export')}
                      >
                        <Database className="h-5 w-5 mr-4 text-blue-500" /> Export System Data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 justify-start px-8 rounded-2xl font-black text-slate-700 dark:text-foreground/90 border-slate-200 dark:border-border hover:bg-slate-50 dark:bg-background transition-all shadow-sm"
                        onClick={() => handleSettingsAction('Security Audit')}
                      >
                        <Shield className="h-5 w-5 mr-4 text-emerald-500" /> Initiate Security Audit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 justify-start px-8 rounded-2xl font-black text-destructive border-slate-200 dark:border-border hover:bg-destructive hover:text-white dark:text-background transition-all shadow-sm"
                        onClick={() => handleSettingsAction('Cache Clearance')}
                      >
                        <Activity className="h-5 w-5 mr-4" /> Purge System Cache
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
