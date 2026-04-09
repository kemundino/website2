import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authService, UserProfile } from "@/firebase/auth";
import { OrderService } from "@/firebase/firestore";
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "customer" | "admin";
  createdAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;
}

export interface Order {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "preparing" | "cooking" | "on_the_way" | "delivered";
  createdAt: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAdmin: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: "customer" | "admin") => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGitHub: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => void;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Firebase user to our User interface
const convertFirebaseUser = (firebaseUser: any, profile: UserProfile): User => ({
  id: firebaseUser.uid,
  name: profile.displayName || firebaseUser.email?.split('@')[0] || 'User',
  email: firebaseUser.email || '',
  avatar: profile.avatar || undefined,
  role: profile.role === 'customer' ? 'user' as const : 'admin' as const,
  createdAt: profile.createdAt?.toISOString(),
  lastLogin: profile.lastLogin?.toISOString(),
  emailVerified: firebaseUser.emailVerified || false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAdmin, setHasAdmin] = useState(false);

  // Initialize auth state listener
  useEffect(() => {
    console.log('🔐 Setting up Firebase auth listener...');
    
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        console.log('👤 Firebase user authenticated:', firebaseUser.email);
        
        try {
          // Get user profile from Firestore
          const profileResult = await authService.getUserProfile(firebaseUser.uid);
          
          if (profileResult.success && profileResult.profile) {
            const convertedUser = convertFirebaseUser(firebaseUser, profileResult.profile);
            setUser(convertedUser);
            console.log('✅ User profile loaded successfully');
            
            // Update last login
            await authService.updateUserProfile(firebaseUser.uid, {
              lastLogin: new Date()
            });
          } else {
            console.error('❌ Failed to load user profile');
            setError('Failed to load user profile');
            await authService.signOut();
          }
        } catch (err) {
          console.error('❌ Error loading user profile:', err);
          setError('Error loading user profile');
          await authService.signOut();
        }
      } else {
        console.log('🔓 No authenticated user');
        setUser(null);
      }
      
      setIsLoading(false);
    });

    // Check if any admin users exist
    const checkAdminUsers = async () => {
      try {
        // For now, we'll set hasAdmin to false and update it when we have proper user service
        setHasAdmin(false);
      } catch (err) {
        console.error('Error checking admin users:', err);
        setHasAdmin(false);
      }
    };

    checkAdminUsers();

    return () => {
      console.log('🔐 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Load user orders
  useEffect(() => {
    if (user) {
      console.log('📦 Loading orders for user:', user.email);
      
      const unsubscribe = OrderService.subscribe((orderData) => {
        const convertedOrders: Order[] = orderData.map(order => ({
          id: order.id,
          items: order.items || [],
          total: order.total || 0,
          status: order.status || "preparing",
          createdAt: order.createdAt?.toDate?.()?.toISOString() || order.createdAt,
          address: order.address || ""
        }));
        
        setOrders(convertedOrders);
        console.log(`📦 Loaded ${convertedOrders.length} orders`);
      });

      return () => {
        unsubscribe();
      };
    } else {
      setOrders([]);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Attempting login for:', email);
      
      const result = await authService.signIn(email, password);
      
      if (result.success) {
        console.log('✅ Login successful');
        toast.success('Welcome back!');
        return true;
      } else {
        console.error('❌ Login failed:', result.error);
        setError(result.error || 'Login failed');
        toast.error(result.error || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = 'An unexpected error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: "customer" | "admin" = "customer"): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📝 Attempting registration for:', email, 'as', role);
      
      // Validate inputs
      if (!name.trim() || name.trim().length < 2) {
        const error = 'Name must be at least 2 characters long';
        setError(error);
        toast.error(error);
        return false;
      }
      
      if (password.length < 6) {
        const error = 'Password must be at least 6 characters long';
        setError(error);
        toast.error(error);
        return false;
      }
      
      // Role is now in correct format (customer/admin)
      const firebaseRole = role;
      
      const result = await authService.signUp(email, password, name.trim(), firebaseRole);
      
      if (result.success) {
        console.log('✅ Registration successful');
        const successMessage = role === 'admin' ? 'Admin account created successfully!' : 'Account created successfully!';
        toast.success(successMessage);
        
        // Update hasAdmin state if admin was created
        if (role === 'admin') {
          setHasAdmin(true);
        }
        
        return true;
      } else {
        console.error('❌ Registration failed:', result.error);
        setError(result.error || 'Registration failed');
        toast.error(result.error || 'Registration failed');
        return false;
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = 'An unexpected error occurred during registration';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [hasAdmin]);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Attempting Google sign-in');
      
      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        console.log('✅ Google sign-in successful');
        toast.success('Welcome! Signed in with Google 🎉');
        return true;
      } else {
        console.error('❌ Google sign-in failed:', result.error);
        setError(result.error || 'Google sign-in failed');
        toast.error(result.error || 'Google sign-in failed');
        return false;
      }
    } catch (err) {
      console.error('❌ Google sign-in error:', err);
      const errorMessage = 'An unexpected error occurred during Google sign-in';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGitHub = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Attempting GitHub sign-in');
      
      const result = await authService.signInWithGitHub();
      
      if (result.success) {
        console.log('✅ GitHub sign-in successful');
        toast.success('Welcome! Signed in with GitHub 🎉');
        return true;
      } else {
        console.error('❌ GitHub sign-in failed:', result.error);
        setError(result.error || 'GitHub sign-in failed');
        toast.error(result.error || 'GitHub sign-in failed');
        return false;
      }
    } catch (err) {
      console.error('❌ GitHub sign-in error:', err);
      const errorMessage = 'An unexpected error occurred during GitHub sign-in';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) {
        const error = 'No authenticated user';
        setError(error);
        toast.error(error);
        return false;
      }
      
      console.log('🔄 Updating profile for user:', user.email);
      
      // Convert our User interface to UserProfile format
      const profileUpdates: Partial<UserProfile> = {
        displayName: data.name || user.name,
        phoneNumber: (data as any).phone,
        address: (data as any).address,
        avatar: data.avatar,
        updatedAt: new Date()
      };
      
      const result = await authService.updateUserProfile(user.id, profileUpdates);
      
      if (result.success) {
        console.log('✅ Profile updated successfully');
        
        // Update local user state
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        
        toast.success('Profile updated successfully!');
        return true;
      } else {
        console.error('❌ Profile update failed:', result.error);
        setError(result.error || 'Profile update failed');
        toast.error(result.error || 'Profile update failed');
        return false;
      }
    } catch (err) {
      console.error('❌ Profile update error:', err);
      const errorMessage = 'An unexpected error occurred while updating profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      console.log('🔓 Logging out user:', user?.email);
      
      const result = await authService.signOut();
      
      if (result.success) {
        setUser(null);
        setOrders([]);
        setError(null);
        toast.success('Logged out successfully');
        console.log('✅ Logout successful');
      } else {
        console.error('❌ Logout failed:', result.error);
        toast.error(result.error || 'Logout failed');
      }
    } catch (err) {
      console.error('❌ Logout error:', err);
      // Force logout even if Firebase fails
      setUser(null);
      setOrders([]);
      setError(null);
      toast.success('Logged out');
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addOrder = useCallback(async (order: Omit<Order, "id" | "createdAt" | "status">) => {
    try {
      console.log('📦 Adding new order for user:', user?.email);
      
      const orderData = {
        ...order,
        customerName: user?.name || 'Guest',
        customerEmail: user?.email || '',
        userId: user?.id || null,
        status: "preparing"
      };
      
      const result = await OrderService.create(orderData);
      
      if (result.success) {
        console.log('✅ Order added successfully');
        
        // Update customer stats if user is logged in
        if (user) {
          await authService.updateCustomerStats(user.id, order.total);
        }
        
        toast.success('Order placed successfully!');
      } else {
        console.error('❌ Failed to add order:', result.error);
        toast.error('Failed to place order');
      }
    } catch (err) {
      console.error('❌ Add order error:', err);
      toast.error('Failed to place order');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      hasAdmin,
      login, 
      register, 
      loginWithGoogle,
      loginWithGitHub,
      logout, 
      updateProfile,
      orders, 
      addOrder,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
