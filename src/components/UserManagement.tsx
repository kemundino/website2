import { useState, useEffect } from "react";
import { UserService } from "@/firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User, Mail, Shield, DollarSign, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
  totalSpent?: number;
  ordersCount?: number;
  lastLogin?: any;
  createdAt?: any;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = UserService.subscribe((data) => {
      setUsers(data as UserProfile[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((u) => {
    const search = searchQuery.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(search)) ||
      (u.email?.toLowerCase().includes(search)) ||
      (u.role?.toLowerCase().includes(search))
    );
  });

  const formatDate = (date: any) => {
    if (!date) return "Never";
    if (date.toDate) return date.toDate().toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          placeholder="Search for users by name, email or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-16 pl-16 pr-8 rounded-[1.5rem] bg-card border-none shadow-xl shadow-slate-100/50 dark:shadow-black/20 text-foreground font-bold placeholder:text-muted-foreground focus-visible:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-bold">Scanning User Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-card group">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center text-background font-black text-xl group-hover:scale-110 transition-transform duration-500">
                          {user.name?.[0] || <User size={28} />}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-foreground tracking-tight">{user.name || "Anonymous User"}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail size={12} className="text-muted-foreground" />
                            <p className="text-xs font-bold text-muted-foreground">{user.email || "No email provided"}</p>
                          </div>
                        </div>
                      </div>
                      <Badge className={`border-none px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 
                        user.role === 'staff' ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Shield size={10} />
                          {user.role || 'customer'}
                        </div>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Financial Impact</p>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                            <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-lg font-black text-foreground">${(user.totalSpent || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Total Orders</p>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-lg font-black text-foreground">{user.ordersCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-6 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Joined {formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Active {formatDate(user.lastLogin)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-20 text-center bg-card rounded-[3rem] border-2 border-dashed border-border/50">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-xl font-black text-muted-foreground">No users found matching your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
