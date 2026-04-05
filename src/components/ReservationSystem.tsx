import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, Clock, Users, Phone, Mail, MapPin, CheckCircle, 
  XCircle, AlertCircle, Plus, Edit, Trash2, Eye, Bell,
  Filter, Search, Download, TrendingUp, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  tableId: string;
  tableNumber: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  occasion?: string;
  specialRequests?: string;
  dietaryRestrictions?: string;
  highChairNeeded: boolean;
  accessibilityNeeded: boolean;
  estimatedDuration: number; // in minutes
  actualArrivalTime?: string;
  actualSeatingTime?: string;
  completionTime?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  remindersSent: number;
  customerRating?: number;
  feedback?: string;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  position: { x: number; y: number };
}

interface ReservationStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  noShows: number;
  averagePartySize: number;
  estimatedRevenue: number;
}

const ReservationSystem = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'month' | 'pending' | 'confirmed'>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Reservations' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' }
  ];

  const getCurrentFilterLabel = () => {
    return filterOptions.find(f => f.value === activeFilter)?.label || 'All Reservations';
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Initialize with sample data
  useEffect(() => {
    const sampleReservations: Reservation[] = [
      {
        id: '1',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        customerPhone: '+1234567890',
        partySize: 4,
        reservationDate: new Date().toISOString().split('T')[0],
        reservationTime: '19:00',
        tableId: '1',
        tableNumber: 'T5',
        status: 'confirmed',
        occasion: 'Birthday',
        specialRequests: 'Window seat preferred',
        dietaryRestrictions: 'Vegetarian options needed',
        highChairNeeded: false,
        accessibilityNeeded: false,
        estimatedDuration: 120,
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        remindersSent: 2
      },
      {
        id: '2',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com',
        customerPhone: '+1234567891',
        partySize: 2,
        reservationDate: new Date().toISOString().split('T')[0],
        reservationTime: '20:30',
        tableId: '2',
        tableNumber: 'T3',
        status: 'pending',
        occasion: 'Anniversary',
        specialRequests: 'Quiet corner table',
        highChairNeeded: false,
        accessibilityNeeded: false,
        estimatedDuration: 90,
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        remindersSent: 1
      },
      {
        id: '3',
        customerName: 'Mike Wilson',
        customerEmail: 'mike.w@email.com',
        customerPhone: '+1234567892',
        partySize: 6,
        reservationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reservationTime: '18:00',
        tableId: '3',
        tableNumber: 'T8',
        status: 'confirmed',
        occasion: 'Business Dinner',
        specialRequests: 'Separate checks needed',
        dietaryRestrictions: 'Gluten-free options',
        highChairNeeded: true,
        accessibilityNeeded: false,
        estimatedDuration: 150,
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        remindersSent: 2
      }
    ];

    const sampleTables: Table[] = [
      { id: '1', number: 'T1', capacity: 2, status: 'available', position: { x: 0, y: 0 } },
      { id: '2', number: 'T2', capacity: 4, status: 'available', position: { x: 1, y: 0 } },
      { id: '3', number: 'T3', capacity: 4, status: 'reserved', position: { x: 2, y: 0 } },
      { id: '4', number: 'T4', capacity: 6, status: 'available', position: { x: 0, y: 1 } },
      { id: '5', number: 'T5', capacity: 4, status: 'reserved', position: { x: 1, y: 1 } },
      { id: '6', number: 'T6', capacity: 8, status: 'available', position: { x: 2, y: 1 } },
      { id: '7', number: 'T7', capacity: 2, status: 'available', position: { x: 0, y: 2 } },
      { id: '8', number: 'T8', capacity: 6, status: 'reserved', position: { x: 1, y: 2 } },
    ];

    setReservations(sampleReservations);
    setTables(sampleTables);
  }, []);

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'seated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'seated': return <Users className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no-show': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const addReservation = (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'remindersSent'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      remindersSent: 0
    };
    
    setReservations(prev => [...prev, newReservation]);
    
    // Update table status
    setTables(prev => prev.map(table => 
      table.id === reservationData.tableId ? { ...table, status: 'reserved' } : table
    ));
    
    toast.success('Reservation created successfully');
  };

  const updateReservationStatus = (reservationId: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(reservation => {
      if (reservation.id === reservationId) {
        const updatedReservation = {
          ...reservation,
          status,
          updatedAt: new Date()
        };
        
        // Update table status based on reservation status
        if (status === 'seated') {
          setTables(tables => tables.map(table => 
            table.id === reservation.tableId ? { ...table, status: 'occupied' } : table
          ));
        } else if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
          setTables(tables => tables.map(table => 
            table.id === reservation.tableId ? { ...table, status: 'available' } : table
          ));
        }
        
        return updatedReservation;
      }
      return reservation;
    }));
    
    toast.success(`Reservation status updated to ${status}`);
  };

  const deleteReservation = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      // Free up the table
      setTables(prev => prev.map(table => 
        table.id === reservation.tableId ? { ...table, status: 'available' } : table
      ));
    }
    
    setReservations(prev => prev.filter(r => r.id !== reservationId));
    toast.success('Reservation deleted');
  };

  const getFilteredReservations = () => {
    let filtered = reservations;
    
    // Filter by status/date
    switch (activeFilter) {
      case 'today':
        filtered = filtered.filter(r => r.reservationDate === new Date().toISOString().split('T')[0]);
        break;
      case 'week':
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(r => new Date(r.reservationDate) <= weekFromNow);
        break;
      case 'month':
        const monthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(r => new Date(r.reservationDate) <= monthFromNow);
        break;
      case 'pending':
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 'confirmed':
        filtered = filtered.filter(r => r.status === 'confirmed');
        break;
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerPhone.includes(searchTerm) ||
        r.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter(r => r.reservationDate === selectedDate);
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.reservationDate} ${a.reservationTime}`);
      const dateB = new Date(`${b.reservationDate} ${b.reservationTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getReservationStats = (): ReservationStats => {
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const todayReservations = reservations.filter(r => r.reservationDate === today);
    const weekReservations = reservations.filter(r => new Date(r.reservationDate) <= weekFromNow);
    const monthReservations = reservations.filter(r => new Date(r.reservationDate) <= monthFromNow);
    
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;
    const noShows = reservations.filter(r => r.status === 'no-show').length;
    
    const averagePartySize = reservations.length > 0 
      ? reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length 
      : 0;
    
    // Estimated revenue (assuming $25 per person)
    const estimatedRevenue = confirmed * 4 * 25; // Average party size of 4, $25 per person
    
    return {
      total: reservations.length,
      today: todayReservations.length,
      thisWeek: weekReservations.length,
      thisMonth: monthReservations.length,
      confirmed,
      pending,
      cancelled,
      noShows,
      averagePartySize,
      estimatedRevenue
    };
  };

  const getAvailableTables = (partySize: number, date: string, time: string) => {
    return tables.filter(table => {
      if (table.capacity < partySize) return false;
      
      // Check if table is available for the requested time
      const conflictingReservation = reservations.find(r => {
        if (r.tableId === table.id && r.reservationDate === date) {
          const reservationStart = new Date(`${r.reservationDate} ${r.reservationTime}`);
          const reservationEnd = new Date(reservationStart.getTime() + r.estimatedDuration * 60 * 1000);
          const requestedStart = new Date(`${date} ${time}`);
          const requestedEnd = new Date(requestedStart.getTime() + 120 * 60 * 1000); // 2 hours default
          
          return (requestedStart < reservationEnd && requestedEnd > reservationStart);
        }
        return false;
      });
      
      return !conflictingReservation && table.status !== 'maintenance';
    });
  };

  const stats = getReservationStats();
  const filteredReservations = getFilteredReservations();

  return (
    <div className="space-y-6">
      {/* Reservation Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </Card>
        
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.averagePartySize.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Avg Party Size</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">${stats.estimatedRevenue}</p>
              <p className="text-sm text-muted-foreground">Est. Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isAddReservationOpen} onOpenChange={setIsAddReservationOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Reservation</DialogTitle>
              </DialogHeader>
              <ReservationForm 
                tables={tables}
                existingReservations={reservations}
                onSubmit={addReservation} 
                onCancel={() => setIsAddReservationOpen(false)} 
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

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
      <div className="hidden md:flex gap-2 flex-wrap">
        {(['all', 'today', 'week', 'month', 'pending', 'confirmed'] as const).map((filter) => (
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

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id} className={`border-2 ${getStatusColor(reservation.status)}`}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(reservation.status)}
                    <span className="font-bold text-base sm:text-lg">{reservation.customerName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Badge className={`${getStatusColor(reservation.status)} text-xs`}>
                      {reservation.status}
                    </Badge>
                    {reservation.occasion && (
                      <Badge variant="outline" className="text-xs">{reservation.occasion}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-medium text-sm sm:text-base">{reservation.reservationTime}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {new Date(reservation.reservationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{reservation.partySize} guests</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Table {reservation.tableNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">{reservation.customerPhone}</span>
                  <span className="sm:hidden">Phone</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{reservation.estimatedDuration} min</span>
                </div>
              </div>
              
              {(reservation.specialRequests || reservation.dietaryRestrictions || reservation.highChairNeeded || reservation.accessibilityNeeded) && (
                <div className="mt-2 space-y-1">
                  {reservation.specialRequests && (
                    <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Special: {reservation.specialRequests}
                    </p>
                  )}
                  {reservation.dietaryRestrictions && (
                    <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      Dietary: {reservation.dietaryRestrictions}
                    </p>
                  )}
                  {(reservation.highChairNeeded || reservation.accessibilityNeeded) && (
                    <div className="flex gap-2">
                      {reservation.highChairNeeded && (
                        <Badge variant="outline">High Chair Needed</Badge>
                      )}
                      {reservation.accessibilityNeeded && (
                        <Badge variant="outline">Accessibility Needed</Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {reservation.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                      className="flex-1 sm:flex-none"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                  )}
                  {reservation.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updateReservationStatus(reservation.id, 'seated')}
                      className="flex-1 sm:flex-none"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Seat
                    </Button>
                  )}
                  {reservation.status === 'seated' && (
                    <Button
                      size="sm"
                      onClick={() => updateReservationStatus(reservation.id, 'completed')}
                      className="flex-1 sm:flex-none"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                    className="flex-1 sm:flex-none"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReservation(reservation)} className="flex-1 sm:flex-none">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Reservation Details</DialogTitle>
                      </DialogHeader>
                      <ReservationDetails reservation={reservation} />
                      <ReservationActions 
                        reservation={reservation}
                        onUpdateStatus={updateReservationStatus}
                        onDelete={deleteReservation}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive flex-1 sm:flex-none"
                    onClick={() => deleteReservation(reservation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No reservations found</p>
        </div>
      )}
    </div>
  );
};

// Reservation Form Component
const ReservationForm = ({ 
  tables, 
  existingReservations,
  onSubmit, 
  onCancel 
}: { 
  tables: Table[], 
  existingReservations: Reservation[],
  onSubmit: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'remindersSent'>) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    partySize: 2,
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '19:00',
    tableId: '',
    tableNumber: '',
    status: 'pending' as Reservation['status'],
    occasion: '',
    specialRequests: '',
    dietaryRestrictions: '',
    highChairNeeded: false,
    accessibilityNeeded: false,
    estimatedDuration: 120,
    notes: '',
    createdBy: 'admin'
  });

  const [availableTables, setAvailableTables] = useState<Table[]>([]);

  useEffect(() => {
    if (formData.partySize && formData.reservationDate && formData.reservationTime) {
      const available = tables.filter(table => {
        if (table.capacity < formData.partySize) return false;
        
        const conflictingReservation = existingReservations.find(r => {
          if (r.tableId === table.id && r.reservationDate === formData.reservationDate) {
            const reservationStart = new Date(`${r.reservationDate} ${r.reservationTime}`);
            const reservationEnd = new Date(reservationStart.getTime() + r.estimatedDuration * 60 * 1000);
            const requestedStart = new Date(`${formData.reservationDate} ${formData.reservationTime}`);
            const requestedEnd = new Date(requestedStart.getTime() + formData.estimatedDuration * 60 * 1000);
            
            return (requestedStart < reservationEnd && requestedEnd > reservationStart);
          }
          return false;
        });
        
        return !conflictingReservation && table.status !== 'maintenance';
      });
      
      setAvailableTables(available);
    }
  }, [formData.partySize, formData.reservationDate, formData.reservationTime, tables, existingReservations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTable = tables.find(t => t.id === formData.tableId);
    onSubmit({
      ...formData,
      tableNumber: selectedTable?.number || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="customerEmail">Email *</Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerPhone">Phone *</Label>
          <Input
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="partySize">Party Size *</Label>
          <Select value={formData.partySize.toString()} onValueChange={(value) => setFormData({ ...formData, partySize: parseInt(value) })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8,9,10].map(size => (
                <SelectItem key={size} value={size.toString()}>{size} {size === 1 ? 'person' : 'people'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reservationDate">Date *</Label>
          <Input
            id="reservationDate"
            type="date"
            value={formData.reservationDate}
            onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div>
          <Label htmlFor="reservationTime">Time *</Label>
          <Select value={formData.reservationTime} onValueChange={(value) => setFormData({ ...formData, reservationTime: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map(time => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="tableId">Select Table *</Label>
        <Select value={formData.tableId} onValueChange={(value) => setFormData({ ...formData, tableId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select an available table" />
          </SelectTrigger>
          <SelectContent>
            {availableTables.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                Table {table.number} ({table.capacity} seats)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableTables.length === 0 && (
          <p className="text-sm text-muted-foreground mt-1">No available tables for selected time and party size</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="occasion">Occasion (Optional)</Label>
        <Select value={formData.occasion} onValueChange={(value) => setFormData({ ...formData, occasion: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select occasion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            <SelectItem value="Birthday">Birthday</SelectItem>
            <SelectItem value="Anniversary">Anniversary</SelectItem>
            <SelectItem value="Business">Business Dinner</SelectItem>
            <SelectItem value="Date">Date Night</SelectItem>
            <SelectItem value="Family">Family Gathering</SelectItem>
            <SelectItem value="Celebration">Celebration</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
        <Select value={formData.estimatedDuration.toString()} onValueChange={(value) => setFormData({ ...formData, estimatedDuration: parseInt(value) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
            <SelectItem value="150">2.5 hours</SelectItem>
            <SelectItem value="180">3 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Textarea
          id="specialRequests"
          value={formData.specialRequests}
          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
          placeholder="Any special requests or preferences..."
        />
      </div>
      
      <div>
        <Label htmlFor="dietaryRestrictions">Dietary Restrictions (Optional)</Label>
        <Textarea
          id="dietaryRestrictions"
          value={formData.dietaryRestrictions}
          onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
          placeholder="Any dietary restrictions or allergies..."
        />
      </div>
      
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.highChairNeeded}
            onChange={(e) => setFormData({ ...formData, highChairNeeded: e.target.checked })}
          />
          <span>High chair needed</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.accessibilityNeeded}
            onChange={(e) => setFormData({ ...formData, accessibilityNeeded: e.target.checked })}
          />
          <span>Accessibility needed</span>
        </label>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={availableTables.length === 0}>
          Create Reservation
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

// Reservation Details Component
const ReservationDetails = ({ reservation }: { reservation: Reservation }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Customer Name</Label>
          <p>{reservation.customerName}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Email</Label>
          <p>{reservation.customerEmail}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Phone</Label>
          <p>{reservation.customerPhone}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Party Size</Label>
          <p>{reservation.partySize} guests</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Date & Time</Label>
          <p>{new Date(reservation.reservationDate).toLocaleDateString()} at {reservation.reservationTime}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Table</Label>
          <p>{reservation.tableNumber}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Duration</Label>
          <p>{reservation.estimatedDuration} minutes</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Badge>{reservation.status}</Badge>
        </div>
      </div>
      
      {reservation.occasion && (
        <div>
          <Label className="text-sm font-medium">Occasion</Label>
          <p>{reservation.occasion}</p>
        </div>
      )}
      
      {reservation.specialRequests && (
        <div>
          <Label className="text-sm font-medium">Special Requests</Label>
          <p className="text-blue-600 bg-blue-50 p-2 rounded">{reservation.specialRequests}</p>
        </div>
      )}
      
      {reservation.dietaryRestrictions && (
        <div>
          <Label className="text-sm font-medium">Dietary Restrictions</Label>
          <p className="text-orange-600 bg-orange-50 p-2 rounded">{reservation.dietaryRestrictions}</p>
        </div>
      )}
      
      <div className="flex gap-4">
        {reservation.highChairNeeded && (
          <Badge variant="outline">High Chair Needed</Badge>
        )}
        {reservation.accessibilityNeeded && (
          <Badge variant="outline">Accessibility Needed</Badge>
        )}
      </div>
      
      {reservation.notes && (
        <div>
          <Label className="text-sm font-medium">Notes</Label>
          <p>{reservation.notes}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div>
          <Label className="text-sm font-medium">Created</Label>
          <p>{new Date(reservation.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Last Updated</Label>
          <p>{new Date(reservation.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// Reservation Actions Component
const ReservationActions = ({ 
  reservation, 
  onUpdateStatus, 
  onDelete 
}: { 
  reservation: Reservation, 
  onUpdateStatus: (id: string, status: Reservation['status']) => void,
  onDelete: (id: string) => void
}) => {
  return (
    <div className="flex gap-2 pt-4 border-t">
      {reservation.status === 'pending' && (
        <Button onClick={() => onUpdateStatus(reservation.id, 'confirmed')}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirm Reservation
        </Button>
      )}
      {reservation.status === 'confirmed' && (
        <Button onClick={() => onUpdateStatus(reservation.id, 'seated')}>
          <Users className="h-4 w-4 mr-2" />
          Mark as Seated
        </Button>
      )}
      {reservation.status === 'seated' && (
        <Button onClick={() => onUpdateStatus(reservation.id, 'completed')}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Completed
        </Button>
      )}
      <Button 
        variant="outline" 
        onClick={() => onUpdateStatus(reservation.id, 'cancelled')}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button 
        variant="outline" 
        className="text-destructive"
        onClick={() => onDelete(reservation.id)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  );
};

export default ReservationSystem;
