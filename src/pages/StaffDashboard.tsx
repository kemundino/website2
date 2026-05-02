import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContextFirebase';
import { db } from '@/firebase/config';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, User, LogOut, CheckCircle, 
  AlertCircle, ChefHat, Timer, MapPin, Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface Shift {
  id: string;
  staffId: string;
  date: any;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'active' | 'completed' | 'absent';
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'on_break' | 'off_duty';
}

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staffInfo, setStaffInfo] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    let unsubscribeShifts: () => void;
    let unsubscribeStaff: () => void;

    const setupData = async () => {
      // 1. Get the staff document for this user
      const staffQuery = query(collection(db, 'staff'), where('email', '==', user.email));
      unsubscribeStaff = onSnapshot(staffQuery, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data() as StaffMember;
          setStaffInfo({ ...data, id: doc.id });
          
          // 2. Once we have staffId, listen to their shifts
          const shiftsQuery = query(
            collection(db, 'shifts'), 
            where('staffId', '==', doc.id),
            orderBy('date', 'desc')
          );
          
          unsubscribeShifts = onSnapshot(shiftsQuery, (shiftSnapshot) => {
            const shiftsData = shiftSnapshot.docs.map(shiftDoc => ({
              id: shiftDoc.id,
              ...shiftDoc.data()
            } as Shift));
            setShifts(shiftsData);
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      });
    };

    setupData();

    return () => {
      if (unsubscribeShifts) unsubscribeShifts();
      if (unsubscribeStaff) unsubscribeStaff();
    };
  }, [user]);

  const toggleDutyStatus = async () => {
    if (!staffInfo) return;
    const newStatus = staffInfo.status === 'off_duty' ? 'active' : 'off_duty';
    try {
      await updateDoc(doc(db, 'staff', staffInfo.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`You are now ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatShiftDate = (date: any) => {
    if (!date) return '';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getShiftStatusColor = (status: Shift['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-none">Staff Portal</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-destructive">
            <LogOut className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        {/* Status Card */}
        <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden">
          <div className="h-2 bg-primary" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner ${
                  staffInfo?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Timer className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Duty Status</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                      staffInfo?.status === 'active' ? 'bg-green-500' : 'bg-slate-300'
                    }`} />
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                      {staffInfo?.status === 'active' ? 'Currently on Shift' : 'Off Duty'}
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={toggleDutyStatus}
                size="lg"
                className={`h-14 px-8 rounded-2xl font-black transition-all active:scale-95 ${
                  staffInfo?.status === 'active' 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-none' 
                    : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                }`}
              >
                {staffInfo?.status === 'active' ? 'Clock Out' : 'Clock In'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Shifts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              My Weekly Schedule
            </h2>
          </div>

          <div className="grid gap-4">
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <Card key={shift.id} className="border-none shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${getShiftStatusColor(shift.status)} font-bold px-3 py-1 rounded-lg border-2`}>
                            {shift.status.toUpperCase()}
                          </Badge>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{shift.position}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{formatShiftDate(shift.date)}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              {shift.startTime} — {shift.endTime}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                              <MapPin className="h-4 w-4 text-primary" />
                              Main Floor
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:flex h-12 w-12 rounded-xl bg-slate-50 items-center justify-center group-hover:bg-primary/5 transition-colors">
                        <CheckCircle className="h-6 w-6 text-slate-200 group-hover:text-primary/40" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-400">No Shifts Assigned</h3>
                <p className="text-slate-400 font-medium mt-2 px-8">Relax! You don't have any upcoming shifts scheduled at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Help */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-purple-600 border-none p-6 text-white overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <Bell className="h-8 w-8 mb-4 opacity-80" />
            <h4 className="text-lg font-black mb-1">Notifications</h4>
            <p className="text-white/70 text-sm font-medium">New shifts will appear here instantly when assigned by Admin.</p>
          </Card>
          
          <Card className="bg-slate-900 border-none p-6 text-white overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <AlertCircle className="h-8 w-8 mb-4 text-primary" />
            <h4 className="text-lg font-black mb-1">Support</h4>
            <p className="text-white/50 text-sm font-medium">Contact your manager if you need to request a shift swap.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
