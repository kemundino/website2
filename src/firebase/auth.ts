import { auth } from './config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  linkWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { UserService } from './firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'customer';
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  loyaltyPoints?: number;
  totalOrders?: number;
  memberSince?: Date;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class AuthService {
  // Sign in with email and password
  async signIn(
    email: string,
    password: string,
    rememberMe = true
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      try {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (pErr) {
        console.warn('setPersistence failed; using default auth storage:', pErr);
      }
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Sign up with email and password
  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: 'admin' | 'customer' = 'customer',
    rememberMe = true
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      try {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (pErr) {
        console.warn('setPersistence failed; using default auth storage:', pErr);
      }
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: displayName,
        role: role,
        loyaltyPoints: 0,
        totalOrders: 0,
        memberSince: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await UserService.create(userProfile);
      
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak (minimum 6 characters)';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        default:
          errorMessage = error.message || 'Failed to create account';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message || 'Failed to sign out' };
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const normalizeProfile = (data: Record<string, unknown>, authUid: string): UserProfile | null => {
        const email = data.email as string | undefined;
        const rawRole = data.role as string | undefined;
        if (!email) return null;

        let role: 'admin' | 'customer';
        if (rawRole === 'admin') role = 'admin';
        else if (rawRole === 'customer' || rawRole === 'user') role = 'customer';
        else if (rawRole) {
          console.warn('Unknown role in Firestore profile; defaulting to customer:', rawRole);
          role = 'customer';
        } else {
          return null;
        }

        const docUid = typeof data.uid === 'string' && data.uid ? data.uid : authUid;
        return { ...(data as unknown as UserProfile), uid: docUid, email, role };
      };

      const result = await UserService.getOne(uid);
      if (result.success && result.data) {
        const profile = normalizeProfile(result.data as Record<string, unknown>, uid);
        if (profile) return { success: true, profile };
        return { success: false, error: 'Invalid user profile structure' };
      }

      // Legacy: profile was saved with addDoc (random doc id) but field `uid` matches Auth.
      const legacy = await UserService.getByUidField(uid);
      if (legacy.success && legacy.data?.length) {
        const row = legacy.data[0] as Record<string, unknown>;
        const profile = normalizeProfile(row, uid);
        if (profile) {
          try {
            await UserService.mergeCanonicalFromRow(uid, row);
          } catch (syncErr) {
            console.warn('Could not sync canonical users/{uid} document (non-fatal):', syncErr);
          }
          return { success: true, profile };
        }
        return { success: false, error: 'Invalid user profile structure' };
      }

      return { success: false, error: 'User profile not found' };
    } catch (error: any) {
      console.error('Get user profile error:', error);
      return { success: false, error: error.message || 'Failed to get user profile' };
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      const result = await UserService.update(uid, updateData);
      return { success: result.success, error: result.success ? undefined : (result.error as string) };
    } catch (error: any) {
      console.error('Update user profile error:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  }

  // Reset password (sends email)
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would require importing sendPasswordResetEmail from firebase/auth
      // For now, we'll return a placeholder
      console.log('Password reset requested for:', email);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'Failed to send reset email' };
    }
  }

  // Check if user is admin
  async isAdmin(uid: string): Promise<boolean> {
    try {
      const result = await this.getUserProfile(uid);
      return result.success ? result.profile?.role === 'admin' : false;
    } catch (error) {
      console.error('Check admin status error:', error);
      return false;
    }
  }

  // Update customer stats (orders, loyalty points, etc.)
  async updateCustomerStats(uid: string, orderTotal: number): Promise<{ success: boolean; error?: string }> {
    try {
      const profileResult = await this.getUserProfile(uid);
      if (!profileResult.success || !profileResult.profile) {
        return { success: false, error: 'User profile not found' };
      }

      const profile = profileResult.profile;
      const loyaltyPoints = Math.floor(orderTotal / 10); // 1 point per $10 spent
      
      const updates = {
        totalOrders: (profile.totalOrders || 0) + 1,
        loyaltyPoints: (profile.loyaltyPoints || 0) + loyaltyPoints,
        updatedAt: new Date()
      };

      return await this.updateUserProfile(uid, updates);
    } catch (error: any) {
      console.error('Update customer stats error:', error);
      return { success: false, error: error.message || 'Failed to update customer stats' };
    }
  }

  // Sign in with Google
  async signInWithGoogle(rememberMe = true): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      try {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (pErr) {
        console.warn('setPersistence failed; using default auth storage:', pErr);
      }
      const provider = new GoogleAuthProvider();
      const result: UserCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore, create profile if not
      const existingProfile = await this.getUserProfile(result.user.uid);
      if (!existingProfile.success) {
        // Create user profile for OAuth user
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || 'Google User',
          role: 'customer', // Default role for OAuth users
          avatar: result.user.photoURL ?? undefined,
          loyaltyPoints: 0,
          totalOrders: 0,
          memberSince: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await UserService.create(userProfile);
      }
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in popup was closed';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Sign-in popup was blocked by the browser';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in with Google';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Sign in with GitHub
  async signInWithGitHub(rememberMe = true): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      try {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (pErr) {
        console.warn('setPersistence failed; using default auth storage:', pErr);
      }
      const provider = new GithubAuthProvider();
      const result: UserCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore, create profile if not
      const existingProfile = await this.getUserProfile(result.user.uid);
      if (!existingProfile.success) {
        // Create user profile for OAuth user
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || 'GitHub User',
          role: 'customer', // Default role for OAuth users
          avatar: result.user.photoURL ?? undefined,
          loyaltyPoints: 0,
          totalOrders: 0,
          memberSince: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await UserService.create(userProfile);
      }
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('GitHub sign-in error:', error);
      let errorMessage = 'Failed to sign in with GitHub';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in popup was closed';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Sign-in popup was blocked by the browser';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in with GitHub';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Link OAuth provider to existing email account
  async linkOAuthProvider(provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'No user is currently signed in' };
      }

      let authProvider;
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
      } else {
        authProvider = new GithubAuthProvider();
      }

      await linkWithPopup(currentUser, authProvider);
      return { success: true };
    } catch (error: any) {
      console.error('Link OAuth provider error:', error);
      return { success: false, error: error.message || 'Failed to link account' };
    }
  }
}

export const authService = new AuthService();
export default authService;
