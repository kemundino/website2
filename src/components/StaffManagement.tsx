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

  // Initialize with sample data
  useEffect(() => {
    const sampleStaff: StaffMember[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@restaurant.com',
        phone: '+1234567890',
        role: 'chef',
        status: 'active',
        hireDate: new Date('2022-01-15'),
        hourlyRate: 25,
        address: '123 Main St, City, State',
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+0987654321',
          relationship: 'Spouse'
        },
        skills: ['Grilling', 'Sauce Making', 'Menu Development'],
        certifications: ['Food Safety Certificate', 'Culinary Degree'],
        schedule: [
          { id: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', position: 'Head Chef' },
          { id: '2', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', position: 'Head Chef' }
        ],
        performance: {
          attendanceRate: 95,
          punctualityRate: 98,
          customerRating: 4.8,
          ordersPerHour: 15,
          errorRate: 2,
          lastReview: new Date('2024-02-15')
        }
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@restaurant.com',
        phone: '+1234567891',
        role: 'server',
        status: 'active',
        hireDate: new Date('2023-03-20'),
        hourlyRate: 18,
        address: '456 Oak Ave, City, State',
        emergencyContact: {
          name: 'Mike Johnson',
          phone: '+0987654322',
          relationship: 'Brother'
        },
        skills: ['Customer Service', 'Upselling', 'Wine Knowledge'],
        certifications: ['Responsible Serving Certificate'],
        schedule: [
          { id: '3', dayOfWeek: 'Wednesday', startTime: '16:00', endTime: '23:00', position: 'Server' },
          { id: '4', dayOfWeek: 'Thursday', startTime: '16:00', endTime: '23:00', position: 'Server' }
        ],
        performance: {
          attendanceRate: 92,
          punctualityRate: 95,
          customerRating: 4.6,
          ordersPerHour: 12,
          errorRate: 3,
          lastReview: new Date('2024-01-20')
        }
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@restaurant.com',
        phone: '+1234567892',
        role: 'manager',
        status: 'active',
        hireDate: new Date('2021-06-10'),
        hourlyRate: 35,
        address: '789 Pine Rd, City, State',
        emergencyContact: {
          name: 'Lisa Wilson',
          phone: '+0987654323',
          relationship: 'Wife'
        },
        skills: ['Leadership', 'Inventory Management', 'Customer Relations'],
        certifications: ['Restaurant Management Certificate', 'Food Safety Certificate'],
        schedule: [
          { id: '5', dayOfWeek: 'Monday', startTime: '08:00', endTime: '18:00', position: 'Manager' },
          { id: '6', dayOfWeek: 'Friday', startTime: '08:00', endTime: '18:00', position: 'Manager' }
        ],
        performance: {
          attendanceRate: 98,
          punctualityRate: 99,
          customerRating: 4.9,
          ordersPerHour: 8,
          errorRate: 1,
          lastReview: new Date('2024-03-01')
        }
      }
    ];

    const sampleShifts: Shift[] = [
      {
        id: '1',
        staffId: '1',
        date: '2024-03-31',
        startTime: '09:00',
        endTime: '17:00',
        position: 'Head Chef',
        status: 'scheduled'
      },
      {
        id: '2',
        staffId: '2',
        date: '2024-03-31',
        startTime: '16:00',
        endTime: '23:00',
        position: 'Server',
        status: 'in-progress',
        actualStartTime: '15:55'
      }
    ];

    setStaff(sampleStaff);
    setShifts(sampleShifts);
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

  const addStaffMember = (staffData: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...staffData,
      id: Date.now().toString(),
    };
    setStaff(prev => [...prev, newStaff]);
    toast.success('Staff member added successfully');
  };

  const updateStaffStatus = (staffId: string, status: StaffMember['status']) => {
    setStaff(prev => prev.map(member => 
      member.id === staffId ? { ...member, status } : member
    ));
    toast.success('Staff status updated');
  };

  const deleteStaffMember = (staffId: string) => {
    setStaff(prev => prev.filter(member => member.id !== staffId));
    toast.success('Staff member removed');
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
      <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Weekly Schedule</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Previous Week</Button>
          <Button variant="outline" size="sm">Next Week</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="border rounded-lg p-2">
            <h4 className="font-medium text-center mb-2">{day}</h4>
            <div className="space-y-1">
              {shifts.filter(shift => {
                const shiftDate = new Date(shift.date);
                const dayOfWeek = shiftDate.getDay();
                const weekDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                return weekDay === ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day);
              }).map((shift) => {
                const staffMember = staff.find(s => s.id === shift.staffId);
                return (
                  <div key={shift.id} className={`p-2 rounded text-xs ${getShiftStatusColor(shift.status)}`}>
                    <div className="font-medium">{staffMember?.firstName}</div>
                    <div>{shift.startTime} - {shift.endTime}</div>
                    <div>{shift.position}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
