import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Users, UserPlus, Calendar, Clock, DollarSign, Award,
  Edit, Trash2, Eye, Mail, Phone, MapPin, Briefcase,
  TrendingUp, AlertCircle, CheckCircle, XCircle, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/firebase/config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: 'active' | 'inactive' | 'on-leave';
  hireDate: Date;
  hourlyRate: number;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  certifications: string[];
  schedule: ScheduleEntry[];
  performance: PerformanceMetrics;
}

interface ScheduleEntry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  position: string;
}

interface PerformanceMetrics {
  attendanceRate: number;
  punctualityRate: number;
  customerRating: number;
  ordersPerHour: number;
  errorRate: number;
  lastReview: Date;
}

interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'absent';
  actualStartTime?: string;
  actualEndTime?: string;
}

type StaffRole = 'manager' | 'chef' | 'cook' | 'server' | 'host' | 'busser' | 'dishwasher' | 'bartender';

const StaffManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'on-leave'>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Staff' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on-leave', label: 'On Leave' }
  ];

  const getCurrentFilterLabel = () => {
    return filterOptions.find(f => f.value === activeFilter)?.label || 'All Staff';
  };
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Helper to safely parse dates from Firestore
  const parseDate = (dateVal: any) => {
    if (!dateVal) return new Date();
    if (dateVal.toDate) return dateVal.toDate();
    if (typeof dateVal === 'string' || typeof dateVal === 'number') return new Date(dateVal);
    return new Date();
  };

  // Listen to Firestore for live data
  useEffect(() => {
    let unsubscribeStaff: () => void;
    let unsubscribeShifts: () => void;

    const setupListeners = async () => {
      // 1. Listen to Staff
      unsubscribeStaff = onSnapshot(collection(db, 'staff'), async (snapshot) => {
        // Parse documents
        const staffData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            hireDate: parseDate(data.hireDate),
            performance: {
              ...data.performance,
              lastReview: parseDate(data.performance?.lastReview)
            }
          } as StaffMember;
        });
        setStaff(staffData);
      });

      // 2. Listen to Shifts
      unsubscribeShifts = onSnapshot(collection(db, 'shifts'), (snapshot) => {
        const shiftsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
        setShifts(shiftsData);
      });
    };

    setupListeners();

    return () => {
      if (unsubscribeStaff) unsubscribeStaff();
      if (unsubscribeShifts) unsubscribeShifts();
    };
  }, []);

  const getRoleColor = (role: StaffRole) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'chef': return 'bg-red-100 text-red-800';
      case 'cook': return 'bg-orange-100 text-orange-800';
      case 'server': return 'bg-blue-100 text-blue-800';
      case 'host': return 'bg-green-100 text-green-800';
      case 'busser': return 'bg-yellow-100 text-yellow-800';
      case 'dishwasher': return 'bg-gray-100 text-gray-800';
      case 'bartender': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftStatusColor = (status: Shift['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addStaffMember = async (staffData: Omit<StaffMember, 'id'>) => {
    try {
      await addDoc(collection(db, 'staff'), {
        ...staffData,
        createdAt: serverTimestamp()
      });
      toast.success('Staff member added successfully');
      setIsAddStaffOpen(false);
    } catch (error) {
      toast.error('Failed to add staff member');
      console.error(error);
    }
  };

  const updateStaffStatus = async (staffId: string, status: StaffMember['status']) => {
    try {
      await updateDoc(doc(db, 'staff', staffId), { status });
      toast.success('Staff status updated');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const deleteStaffMember = async (staffId: string) => {
    try {
      await deleteDoc(doc(db, 'staff', staffId));
      toast.success('Staff member removed');
    } catch (error) {
      toast.error('Failed to remove staff member');
      console.error(error);
    }
  };

  const getFilteredStaff = () => {
    if (activeFilter === 'all') return staff;
    return staff.filter(member => member.status === activeFilter);
  };

  const getStaffStats = () => {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const onLeave = staff.filter(s => s.status === 'on-leave').length;
    const todayShifts = shifts.filter(s => s.date === new Date().toISOString().split('T')[0]).length;
    const inProgress = shifts.filter(s => s.status === 'in-progress').length;
    
    return { total, active, onLeave, todayShifts, inProgress };
  };

  const getRoleDistribution = () => {
    const roles: Record<StaffRole, number> = {
      manager: 0,
      chef: 0,
      cook: 0,
      server: 0,
      host: 0,
      busser: 0,
      dishwasher: 0,
      bartender: 0
    };
    
    staff.forEach(member => {
      roles[member.role]++;
    });
    
    return roles;
  };

  const stats = getStaffStats();
  const roleDistribution = getRoleDistribution();

  return (
    <div className="space-y-6">
      {/* Staff Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Staff</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
              <p className="text-sm text-muted-foreground">On Leave</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.todayShifts}</p>
              <p className="text-sm text-muted-foreground">Today's Shifts</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">On Duty</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(roleDistribution).map(([role, count]) => (
              <div key={role} className="text-center">
                <Badge className={getRoleColor(role as StaffRole)}>
                  {role} ({count})
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <AddStaffForm onSubmit={addStaffMember} onCancel={() => setIsAddStaffOpen(false)} />
          </DialogContent>
        </Dialog>
        
        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Manage Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Staff Schedule</DialogTitle>
            </DialogHeader>
            <ScheduleManager staff={staff} shifts={shifts} />
          </DialogContent>
        </Dialog>
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
      <div className="hidden md:flex gap-2">
        {(['all', 'active', 'inactive', 'on-leave'] as const).map((filter) => (
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

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredStaff().map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{member.firstName} {member.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getRoleColor(member.role)}>
                    {member.role}
                  </Badge>
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {member.phone}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${member.hourlyRate}/hr
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Hired {new Date(member.hireDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {member.performance.customerRating}⭐
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attendance</span>
                  <span>{member.performance.attendanceRate}%</span>
                </div>
                <Progress value={member.performance.attendanceRate} className="h-2" />
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedStaff(member)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{member.firstName} {member.lastName} Details</DialogTitle>
                    </DialogHeader>
                    <StaffDetails staff={member} />
                  </DialogContent>
                </Dialog>
                
                <Select onValueChange={(value) => updateStaffStatus(member.id, value as StaffMember['status'])}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => deleteStaffMember(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {getFilteredStaff().length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No staff members found</p>
        </div>
      )}
    </div>
  );
};

// Add Staff Form Component
const AddStaffForm = ({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (staff: Omit<StaffMember, 'id'>) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'server' as StaffRole,
    status: 'active' as StaffMember['status'],
    hireDate: new Date().toISOString().split('T')[0],
    hourlyRate: 15,
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    skills: [] as string[],
    certifications: [] as string[],
    schedule: [] as ScheduleEntry[],
    performance: {
      attendanceRate: 100,
      punctualityRate: 100,
      customerRating: 5,
      ordersPerHour: 0,
      errorRate: 0,
      lastReview: new Date()
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      hireDate: new Date(formData.hireDate),
      performance: {
        ...formData.performance,
        lastReview: new Date(formData.performance.lastReview)
      }
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as StaffRole })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="chef">Chef</SelectItem>
              <SelectItem value="cook">Cook</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="host">Host</SelectItem>
              <SelectItem value="busser">Busser</SelectItem>
              <SelectItem value="dishwasher">Dishwasher</SelectItem>
              <SelectItem value="bartender">Bartender</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
          <Input
            id="hourlyRate"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit">Add Staff Member</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

// Staff Details Component
const StaffDetails = ({ staff }: { staff: StaffMember }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Email</Label>
          <p>{staff.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Phone</Label>
          <p>{staff.phone}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Address</Label>
          <p>{staff.address}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Emergency Contact</Label>
          <p>{staff.emergencyContact.name} ({staff.emergencyContact.relationship})</p>
          <p className="text-sm text-muted-foreground">{staff.emergencyContact.phone}</p>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Skills</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {staff.skills.map((skill, index) => (
            <Badge key={index} variant="outline">{skill}</Badge>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Certifications</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {staff.certifications.map((cert, index) => (
            <Badge key={index} variant="outline">{cert}</Badge>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-3">Performance Metrics</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between">
              <span>Attendance Rate</span>
              <span>{staff.performance.attendanceRate}%</span>
            </div>
            <Progress value={staff.performance.attendanceRate} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between">
              <span>Punctuality Rate</span>
              <span>{staff.performance.punctualityRate}%</span>
            </div>
            <Progress value={staff.performance.punctualityRate} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between">
              <span>Customer Rating</span>
              <span>{staff.performance.customerRating}⭐</span>
            </div>
            <Progress value={(staff.performance.customerRating / 5) * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between">
              <span>Orders Per Hour</span>
              <span>{staff.performance.ordersPerHour}</span>
            </div>
            <Progress value={Math.min((staff.performance.ordersPerHour / 20) * 100, 100)} className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Manager Component
const ScheduleManager = ({ staff, shifts }: { staff: StaffMember[], shifts: Shift[] }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [newShift, setNewShift] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    position: ''
  });

  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(selectedWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const handlePrevWeek = () => {
    const d = new Date(selectedWeek);
    d.setDate(d.getDate() - 7);
    setSelectedWeek(d);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedWeek);
    d.setDate(d.getDate() + 7);
    setSelectedWeek(d);
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'shifts'), {
        ...newShift,
        status: 'scheduled',
        createdAt: serverTimestamp()
      });
      setIsAddShiftOpen(false);
      toast.success('Shift assigned successfully');
    } catch (error) {
      toast.error('Failed to assign shift');
    }
  };

  const handleDeleteShift = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'shifts', id));
      toast.success('Shift removed');
    } catch (error) {
      toast.error('Failed to remove shift');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900">Weekly Schedule</h3>
          <p className="text-sm text-slate-500 font-medium">Week of {startOfWeek.toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-xl overflow-hidden shadow-sm">
            <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="rounded-none border-r"><Calendar className="h-4 w-4 rotate-90" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedWeek(new Date())} className="rounded-none font-bold px-4">Today</Button>
            <Button variant="ghost" size="icon" onClick={handleNextWeek} className="rounded-none border-l"><Calendar className="h-4 w-4 -rotate-90" /></Button>
          </div>
          
          <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/20">
                <Clock className="h-4 w-4 mr-2" />
                Assign Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Assign New Shift</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddShift} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="font-bold">Staff Member</Label>
                  <Select value={newShift.staffId} onValueChange={(v) => setNewShift({...newShift, staffId: v})}>
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Select staff..." />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Date</Label>
                  <Input 
                    type="date" 
                    className="h-12 rounded-xl border-2"
                    value={newShift.date}
                    onChange={(e) => setNewShift({...newShift, date: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Start Time</Label>
                    <Input 
                      type="time" 
                      className="h-12 rounded-xl border-2"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">End Time</Label>
                    <Input 
                      type="time" 
                      className="h-12 rounded-xl border-2"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Position / Role for Shift</Label>
                  <Input 
                    placeholder="e.g. Head Chef, Patio Server" 
                    className="h-12 rounded-xl border-2"
                    value={newShift.position}
                    onChange={(e) => setNewShift({...newShift, position: e.target.value})}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-lg font-black rounded-2xl shadow-xl shadow-primary/20 mt-4">
                  Confirm Assignment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-[2.5rem] border-2 border-slate-100 bg-white">
        <div className="grid grid-cols-7 min-w-[1000px] divide-x-2 divide-slate-50">
          {weekDays.map((date, idx) => {
            const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx];
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <div key={idx} className={`min-h-[400px] flex flex-col ${isToday ? 'bg-primary/[0.02]' : ''}`}>
                <div className={`p-4 text-center border-b-2 ${isToday ? 'border-primary bg-primary/5' : 'border-slate-50'}`}>
                  <p className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-slate-400'}`}>{dayName}</p>
                  <p className={`text-xl font-black mt-1 ${isToday ? 'text-primary' : 'text-slate-900'}`}>{date.getDate()}</p>
                </div>
                <div className="p-3 space-y-3 flex-1">
                  {shifts.filter(shift => {
                    const shiftDate = new Date(shift.date);
                    return shiftDate.toDateString() === date.toDateString();
                  }).map((shift) => {
                    const staffMember = staff.find(s => s.id === shift.staffId);
                    return (
                      <div key={shift.id} className="relative group p-3 rounded-2xl border-2 border-slate-100 bg-white shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="h-3 w-3 text-slate-500" />
                          </div>
                          <p className="text-xs font-black text-slate-900 truncate">
                            {staffMember?.firstName} {staffMember?.lastName?.charAt(0)}.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="text-[10px] font-bold text-primary truncate bg-primary/5 px-2 py-0.5 rounded-full inline-block">
                            {shift.position}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteShift(shift.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-destructive hover:border-destructive opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const getShiftStatusColor = (status: Shift['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'absent': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default StaffManagement;
