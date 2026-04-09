import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Chrome,
  Github,
  Loader2,
  Shield,
  UserCheck
} from "lucide-react";
import PasswordStrength from "@/components/PasswordStrength";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const { login, register, loginWithGoogle, loginWithGitHub, user, isLoading, error, isAuthenticated, hasAdmin, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors when switching forms
  useEffect(() => {
    clearError();
    setFieldErrors({});
  }, [isLogin, clearError]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!isLogin && !name.trim()) {
      errors.name = "Name is required";
    } else if (!isLogin && name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(email, password, rememberMe);
        if (success) {
          toast.success("Welcome back! 🎉");
        }
      } else {
        success = await register(name, email, password, selectedRole);
        if (success) {
          if (selectedRole === "admin") {
            toast.success("Admin account created! You have full access. 🛡️");
          } else {
            toast.success("Account created successfully! 🎉");
          }
        }
      }

if (success) {
  if (selectedRole === "admin") { 
    toast.success("Welcome, Admin!");
    navigate("/admin"); // ወደ አድሚን ዳሽቦርድ ይመራል
  } else {
    toast.success("Welcome back!");
    navigate("/menu"); // ወደ ተራ ተጠቃሚ ሜኑ ይመራል
  }
}
    } catch (err) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      let success = false;
      
      if (provider === "Google") {
        success = await loginWithGoogle();
      } else if (provider === "GitHub") {
        success = await loginWithGitHub();
      }
      
      if (success) {
        toast.success(`Welcome! Signed in with ${provider} 🎉`);
        // Navigation will be handled by the useEffect that watches isAuthenticated
      }
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password reset is demo mode only");
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
          {/* Header */}
          <div className="mb-6 text-center">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-2 font-display text-2xl font-bold text-foreground"
            >
              {isLogin ? "Welcome back" : "Create account"}
            </motion.h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Sign in to your BiteBuzz account" : "Join BiteBuzz and start ordering"}
            </p>
          </div>

          {/* Admin Status */}
          {!isLogin && (
            <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-center gap-2 text-blue-800">
                {hasAdmin ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">User accounts only (Admin exists)</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">First user? You can be Admin!</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-800"
              >
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Login */}
          <div className="mb-6 space-y-2">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialLogin("GitHub")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register Only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm transition-colors ${
                        fieldErrors.name 
                          ? 'border-red-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20' 
                          : 'border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                      }`}
                      disabled={isLoading}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm transition-colors ${
                  fieldErrors.email 
                    ? 'border-red-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20' 
                    : 'border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                }`}
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-lg border bg-background py-3 pl-10 pr-12 text-sm transition-colors ${
                  fieldErrors.password 
                    ? 'border-red-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20' 
                    : 'border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Role Selection (Register Only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-foreground">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("user")}
                      className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                        selectedRole === "user"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                      disabled={isLoading}
                    >
                      <UserCheck className="h-4 w-4 mx-auto mb-1" />
                      Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      disabled={hasAdmin || isLoading}
                      className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                        selectedRole === "admin"
                          ? "border-primary bg-primary/10 text-primary"
                          : hasAdmin
                          ? "border-border bg-muted text-muted-foreground cursor-not-allowed"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Shield className="h-4 w-4 mx-auto mb-1" />
                      Admin
                    </button>
                  </div>
                  {selectedRole === "admin" && !hasAdmin && (
                    <p className="text-xs text-amber-600">
                      ⚠️ First admin gets full system access
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Strength (Register Only) */}
            <AnimatePresence>
              {!isLogin && password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <PasswordStrength password={password} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/20"
                  disabled={isLoading}
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-warm py-3.5 font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                </>
              )}
            </button>
          </form>

          {/* Switch Form */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-semibold text-primary hover:underline"
              disabled={isLoading}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
