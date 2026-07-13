import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Activity, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { setUser } from "../redux/auth/authSlice";
import { toast } from "sonner";
import { useCheckAuth, useSignIn } from "@/api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const signInMutation = useSignIn();
  const { refetch } = useCheckAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", email);
      formDataToSend.append("password", password);

      await signInMutation.mutateAsync(formDataToSend);
      const { data: user } = await refetch();
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
// min-h-[calc(100vh-4rem)]
  return (
    <div className="relative min-h-screen flex items-stretch bg-background overflow-hidden">
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
