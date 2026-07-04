import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Activity, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { authApi } from "../api/authApi";
import { setUser } from "../redux/auth/authSlice";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("email", email);
      params.append("hashed_password", password);

      await authApi.login(params);
      const user = await authApi.me();
      dispatch(setUser(user));
      toast.success("Successfully logged in.");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Invalid email or password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-stretch bg-background overflow-hidden">
      {/* Left Column: Visual/Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-emerald-950 via-teal-900 to-emerald-950 text-white p-12 flex-col justify-between overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute right-[-15%] bottom-[-15%] h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[80px]" />

        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-emerald-300/80 hover:text-emerald-300 transition-colors z-10">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        {/* Core Value Prop Visuals */}
        <div className="my-auto space-y-8 z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner text-emerald-400"
          >
            <Activity className="h-6 w-6 animate-pulse" />
          </motion.div>

          <div className="space-y-3">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl font-extrabold tracking-tight"
            >
              Understand your health dashboard
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-emerald-200/80 text-sm leading-relaxed"
            >
              Sign in to secure access to your diagnostic summaries, specialist roadmaps, and medical literature bookmarks.
            </motion.p>
          </div>

          {/* Secure indicator card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex items-start gap-3"
          >
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold">End-to-End Encryption</h4>
              <p className="text-[11px] text-emerald-300/70 leading-relaxed mt-1">
                Your medical files and chat histories are processed with double-key cryptographic hashes. We support strict HIPAA compliance standards.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-emerald-400/60 z-10">
          © {new Date().getFullYear()} HealthNavigator. Verified HIPAA Secure.
        </p>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Glow for mobile view */}
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none lg:hidden" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px]"
        >
          <Card className="border-border bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Header top colored bar */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
            
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold tracking-tight">Log In</CardTitle>
                <Link to="/" className="lg:hidden text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </Link>
              </div>
              <CardDescription>
                Enter your credentials to access your health portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-xs text-destructive font-medium">
                    {error}
                  </div>
                )}
                
                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 focus-visible:ring-emerald-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 focus-visible:ring-emerald-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-input text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                    Remember device for 30 days
                  </label>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold shadow-md py-5 rounded-lg border-0 gap-2 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Social Login Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or connect with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-xs gap-2 py-4.5 hover:bg-muted/50 border-border">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="text-xs gap-2 py-4.5 hover:bg-muted/50 border-border">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.51 12.09 1.007 1.452 2.207 3.08 3.774 3.02 1.51-.066 2.083-.98 3.907-.98 1.81 0 2.336.98 3.907.95 1.6-.03 2.637-1.47 3.633-2.92 1.157-1.68 1.637-3.32 1.666-3.41-.03-.01-3.18-1.22-3.21-4.83-.03-3.02 2.48-4.47 2.58-4.53-1.42-2.09-3.62-2.33-4.4-2.39-1.92-.16-3.69 1.16-4.66 1.16zM15.702 3.676c.8-1.01 1.34-2.4 1.19-3.79-1.18.05-2.61.79-3.46 1.79-.76.88-1.42 2.29-1.24 3.66 1.32.1 2.68-.65 3.51-1.66z" />
                  </svg>
                  Apple
                </Button>
              </div>
            </CardContent>
            <CardFooter className="justify-center border-t border-border/80 bg-muted/10 py-4">
              <span className="text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Create one
                </Link>
              </span>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
