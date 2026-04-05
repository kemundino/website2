import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
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
  register: (name: string, email: string, password: string, role?: "user" | "admin") => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => void;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password hashing function (for demo - in production use bcrypt)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return btoa(hash.toString()).replace(/=/g, '');
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Real email validation function
const validateEmailReal = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Additional checks for more realistic email validation
  const [localPart, domain] = email.split('@');
  
  // Local part validation
  if (localPart.length < 1 || localPart.length > 64) return false;
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) return false;
  
  // Domain validation
  if (domain.length < 4 || domain.length > 253) return false;
  if (!domain.includes('.')) return false;
  
  const domainParts = domain.split('.');
  if (domainParts.some(part => part.length < 1)) return false;
  
  return true;
};

// Initialize users from localStorage or empty array
const getStoredUsers = (): (User & { password: string; emailVerified: boolean })[] => {
  try {
    const stored = localStorage.getItem('bitebuzz_users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: (User & { password: string; emailVerified: boolean })[]) => {
  try {
    localStorage.setItem('bitebuzz_users', JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
};

const DEMO_ORDERS: Order[] = [
  {
    id: "ord-001",
    items: [
      { name: "Margherita Pizza", quantity: 2, price: 14.99 },
      { name: "Mango Smoothie", quantity: 1, price: 6.99 },
    ],
    total: 36.97,
    status: "delivered",
    createdAt: "2024-03-20T14:30:00Z",
    address: "123 Main St, Downtown",
  },
  {
    id: "ord-002",
    items: [
      { name: "Classic Smash Burger", quantity: 1, price: 12.99 },
      { name: "Tiramisu", quantity: 1, price: 8.99 },
    ],
    total: 21.98,
    status: "on_the_way",
    createdAt: "2024-03-22T18:15:00Z",
    address: "456 Oak Ave, Uptown",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<(User & { password: string; emailVerified: boolean })[]>([]);

  // Check if admin exists
  const hasAdmin = users.some(u => u.role === 'admin');

  // Load users and current user from localStorage on mount
  useEffect(() => {
    const loadAuthData = () => {
      console.log('🔐 Loading auth data on mount...')
      try {
        const storedUsers = getStoredUsers();
        console.log('👥 Loaded users:', storedUsers.length)
        setUsers(storedUsers);
        
        // Try localStorage first, then sessionStorage
        let savedUser = null;
        try {
          savedUser = localStorage.getItem('bitebuzz_user');
          if (!savedUser) {
            savedUser = sessionStorage.getItem('bitebuzz_user');
          }
        } catch (err) {
          console.warn('Failed to access storage:', err);
        }
        
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('👤 Restored user session:', userData.email)
          setUser(userData);
        } else {
          console.log('🔓 No existing user session found')
        }
      } catch (err) {
        console.error('❌ Failed to load auth data:', err);
        // Clear corrupted data
        try {
          localStorage.removeItem('bitebuzz_user');
          sessionStorage.removeItem('bitebuzz_user');
        } catch (clearErr) {
          console.error('Failed to clear corrupted data:', clearErr);
        }
      } finally {
        setIsLoading(false);
        console.log('✅ Auth data loading complete')
      }
    };

    loadAuthData();
  }, []);

  const saveUserToStorage = (userData: User, rememberMe: boolean = false) => {
    console.log('💾 Saving user session:', userData.email, 'rememberMe:', rememberMe)
    try {
      if (rememberMe) {
        localStorage.setItem('bitebuzz_user', JSON.stringify(userData));
        console.log('✅ Saved to localStorage')
      } else {
        sessionStorage.setItem('bitebuzz_user', JSON.stringify(userData));
        console.log('✅ Saved to sessionStorage')
      }
    } catch (err) {
      console.error('❌ Failed to save user to storage:', err);
      // Try fallback to other storage method
      try {
        if (rememberMe) {
          sessionStorage.setItem('bitebuzz_user', JSON.stringify(userData));
          console.log('⚠️ Fallback: Saved to sessionStorage instead')
        } else {
          localStorage.setItem('bitebuzz_user', JSON.stringify(userData));
          console.log('⚠️ Fallback: Saved to localStorage instead')
        }
      } catch (fallbackErr) {
        console.error('❌ Both storage methods failed:', fallbackErr);
      }
    }
  };

  const clearUserFromStorage = () => {
  console.log('🗑️ Clearing user session from storage')
  try {
    localStorage.removeItem('bitebuzz_user');
    sessionStorage.removeItem('bitebuzz_user');
    console.log('✅ User session cleared from storage')
  } catch (err) {
    console.error('❌ Failed to clear user storage:', err);
  }
};

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Validate email format
      if (!validateEmailReal(email)) {
        setError('Please enter a valid email address');
        return false;
      }

      // Find user by email
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!foundUser) {
        setError('No account found with this email address');
        return false;
      }

      // Verify password
      if (!verifyPassword(password, foundUser.password)) {
        setError('Incorrect password');
        return false;
      }

      // Check email verification (for demo, we'll auto-verify)
      if (!foundUser.emailVerified) {
        // Auto-verify for demo purposes
        const updatedUsers = users.map(u => 
          u.id === foundUser.id ? { ...u, emailVerified: true } : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
      }

      // Remove password from user object
      const { password: _, emailVerified, ...userData } = foundUser;
      const updatedUser = { ...userData, lastLogin: new Date().toISOString() };
      
      setUser(updatedUser);
      saveUserToStorage(updatedUser, rememberMe);
      return true;
    } catch (err) {
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [users]);

  const register = useCallback(async (name: string, email: string, password: string, role: "user" | "admin" = "user"): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Validate email format
      if (!validateEmailReal(email)) {
        setError('Please enter a valid email address');
        return false;
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        setError('An account with this email already exists');
        return false;
      }

      // Validate admin role selection
      if (role === 'admin' && hasAdmin) {
        setError('Admin account already exists. Only user accounts can be created.');
        return false;
      }

      // Validate password strength
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }

      if (password.length > 128) {
        setError('Password is too long');
        return false;
      }

      // Validate name
      if (!name.trim() || name.trim().length < 2) {
        setError('Name must be at least 2 characters long');
        return false;
      }

      // Create new user
      const hashedPassword = hashPassword(password);
      const newUser: User & { password: string; emailVerified: boolean } = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role,
        emailVerified: true, // Auto-verify for demo
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Save user to storage
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);

      // Log user in
      const { password: _, emailVerified, ...userData } = newUser;
      setUser(userData);
      saveUserToStorage(userData, true);
      
      return true;
    } catch (err) {
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [users, hasAdmin]);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) return false;
      
      // Update user in users array
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, ...data } : u
      );
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
      
      // Update current user
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      saveUserToStorage(updatedUser, true);
      return true;
    } catch (err) {
      setError('Profile update failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, users]);

  const logout = useCallback(() => {
    setUser(null);
    clearUserFromStorage();
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addOrder = useCallback((order: Omit<Order, "id" | "createdAt" | "status">) => {
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      status: "preparing",
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      hasAdmin,
      login, 
      register, 
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
