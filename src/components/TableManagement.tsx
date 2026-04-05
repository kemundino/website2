import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Clock, CheckCircle, XCircle, AlertCircle, 
  Plus, Edit, Trash2, Eye, Calendar, MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
  currentOrder?: string;
  reservationTime?: string;
  customerName?: string;
  position: { x: number; y: number };
  shape: 'square' | 'round' | 'rectangle';
}

interface Reservation {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationTime: string;
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled';
  specialRequests?: string;
}

const TableManagement = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Initialize with default tables
  useEffect(() => {
    const defaultTables: Table[] = [
      { id: '1', number: 'T1', capacity: 4, status: 'available', position: { x: 0, y: 0 }, shape: 'square' },
      { id: '2', number: 'T2', capacity: 2, status: 'occupied', position: { x: 1, y: 0 }, shape: 'square' },
      { id: '3', number: 'T3', capacity: 6, status: 'reserved', position: { x: 2, y: 0 }, shape: 'rectangle' },
      { id: '4', number: 'T4', capacity: 4, status: 'available', position: { x: 0, y: 1 }, shape: 'square' },
      { id: '5', number: 'T5', capacity: 2, status: 'cleaning', position: { x: 1, y: 1 }, shape: 'square' },
      { id: '6', number: 'T6', capacity: 8, status: 'available', position: { x: 2, y: 1 }, shape: 'rectangle' },
      { id: '7', number: 'T7', capacity: 4, status: 'occupied', position: { x: 0, y: 2 }, shape: 'square' },
      { id: '8', number: 'T8', capacity: 4, status: 'available', position: { x: 1, y: 2 }, shape: 'square' },
      { id: '9', number: 'T9', capacity: 6, status: 'reserved', position: { x: 2, y: 2 }, shape: 'rectangle' },
    ];
    
    const defaultReservations: Reservation[] = [
      {
        id: '1',
        tableId: '3',
        customerName: 'John Smith',
        customerPhone: '+1234567890',
        partySize: 6,
        reservationTime: '2024-03-31T19:00:00',
        status: 'confirmed'
      },
      {
        id: '2',
        tableId: '9',
        customerName: 'Sarah Johnson',
        customerPhone: '+0987654321',
        partySize: 4,
        reservationTime: '2024-03-31T20:30:00',
        status: 'pending'
      }
    ];

    setTables(defaultTables);
    setReservations(defaultReservations);
  }, []);

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cleaning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'occupied': return <Users className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      case 'cleaning': return <AlertCircle className="h-4 w-4" />;
      case 'maintenance': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, status } : table
    ));
    toast.success(`Table status updated to ${status}`);
  };

  const addTable = (tableData: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tableData,
      id: Date.now().toString(),
    };
    setTables(prev => [...prev, newTable]);
    toast.success('Table added successfully');
  };

  const deleteTable = (tableId: string) => {
    setTables(prev => prev.filter(table => table.id !== tableId));
    toast.success('Table deleted successfully');
  };

  const addReservation = (reservationData: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: Date.now().toString(),
    };
    setReservations(prev => [...prev, newReservation]);
    
    // Update table status to reserved
    updateTableStatus(reservationData.tableId, 'reserved');
    toast.success('Reservation created successfully');
  };

  const getTableStats = () => {
    const total = tables.length;
    const available = tables.filter(t => t.status === 'available').length;
    const occupied = tables.filter(t => t.status === 'occupied').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    const cleaning = tables.filter(t => t.status === 'cleaning').length;
    
    return { total, available, occupied, reserved, cleaning };
  };

  const stats = getTableStats();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tables</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
              <p className="text-sm text-muted-foreground">Reserved</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.cleaning}</p>
              <p className="text-sm text-muted-foreground">Cleaning</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            <AddTableForm 
              onSubmit={addTable} 
              onCancel={() => setIsAddTableOpen(false)} 
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={isReservationOpen} onOpenChange={setIsReservationOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reservation</DialogTitle>
            </DialogHeader>
            <ReservationForm 
              tables={tables}
              onSubmit={addReservation} 
              onCancel={() => setIsReservationOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Floor Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg min-h-[300px] sm:min-h-[400px]">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${getStatusColor(table.status)}`}
                onClick={() => setSelectedTable(table)}
              >
                <div className="text-center">
                  <div className="font-bold text-base sm:text-lg">{table.number}</div>
                  <div className="text-xs sm:text-sm flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" />
                    {table.capacity}
                  </div>
                  <div className="mt-1 sm:mt-2">
                    {getStatusIcon(table.status)}
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {table.status}
                  </Badge>
                </div>
                
                {table.customerName && (
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1 sm:px-2 py-1 rounded-full truncate max-w-[60px] sm:max-w-none">
                    <span className="hidden sm:inline">{table.customerName}</span>
                    <span className="sm:hidden">{table.customerName.slice(0, 5)}...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Table Details */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Table {selectedTable.number} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Capacity</Label>
                <p className="text-lg">{selectedTable.capacity} seats</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge className={getStatusColor(selectedTable.status)}>
                  {selectedTable.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Shape</Label>
                <p className="text-lg capitalize">{selectedTable.shape}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Actions</Label>
                <div className="flex gap-2 mt-1">
                  <Select onValueChange={(value) => updateTableStatus(selectedTable.id, value as Table['status'])}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => deleteTable(selectedTable.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <div className="space-y-3">
              {reservations.map((reservation) => {
                const table = tables.find(t => t.id === reservation.tableId);
                return (
                  <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{reservation.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reservation.reservationTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{reservation.partySize}</span>
                        <span>•</span>
                        <span>Table {table?.number}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                        {reservation.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reservations for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Add Table Form Component
const AddTableForm = ({ onSubmit, onCancel }: { onSubmit: (table: Omit<Table, 'id'>) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    number: '',
    capacity: 4,
    shape: 'square' as Table['shape'],
    status: 'available' as Table['status'],
    position: { x: 0, y: 0 }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tableNumber">Table Number</Label>
        <Input
          id="tableNumber"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
          placeholder="e.g., T1, T2"
          required
        />
      </div>
      <div>
        <Label htmlFor="capacity">Capacity</Label>
        <Select value={formData.capacity.toString()} onValueChange={(value) => setFormData({ ...formData, capacity: parseInt(value) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 seats</SelectItem>
            <SelectItem value="4">4 seats</SelectItem>
            <SelectItem value="6">6 seats</SelectItem>
            <SelectItem value="8">8 seats</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="shape">Table Shape</Label>
        <Select value={formData.shape} onValueChange={(value) => setFormData({ ...formData, shape: value as Table['shape'] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="round">Round</SelectItem>
            <SelectItem value="rectangle">Rectangle</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Add Table</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

// Reservation Form Component
const ReservationForm = ({ 
  tables, 
  onSubmit, 
  onCancel 
}: { 
  tables: Table[], 
  onSubmit: (reservation: Omit<Reservation, 'id'>) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    partySize: 2,
    reservationTime: '',
    specialRequests: '',
    status: 'pending' as Reservation['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onCancel();
  };

  const availableTables = tables.filter(t => t.status === 'available');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="customerPhone">Phone Number</Label>
        <Input
          id="customerPhone"
          value={formData.customerPhone}
          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="tableId">Select Table</Label>
        <Select value={formData.tableId} onValueChange={(value) => setFormData({ ...formData, tableId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a table" />
          </SelectTrigger>
          <SelectContent>
            {availableTables.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                Table {table.number} ({table.capacity} seats)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="partySize">Party Size</Label>
        <Select value={formData.partySize.toString()} onValueChange={(value) => setFormData({ ...formData, partySize: parseInt(value) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 person</SelectItem>
            <SelectItem value="2">2 people</SelectItem>
            <SelectItem value="3">3 people</SelectItem>
            <SelectItem value="4">4 people</SelectItem>
            <SelectItem value="5">5 people</SelectItem>
            <SelectItem value="6">6 people</SelectItem>
            <SelectItem value="7">7 people</SelectItem>
            <SelectItem value="8">8 people</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="reservationTime">Reservation Time</Label>
        <Input
          id="reservationTime"
          type="datetime-local"
          value={formData.reservationTime}
          onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Input
          id="specialRequests"
          value={formData.specialRequests}
          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
          placeholder="Any special requirements..."
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Create Reservation</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default TableManagement;
