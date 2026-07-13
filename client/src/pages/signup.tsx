import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { authApi } from "../api/authApi";
import { setUser } from "../redux/auth/authSlice";
import { toast } from "sonner";

export default function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password criteria states
  const [criteria, setCriteria] = useState({
    length: false,
    number: false,
    special: false,
    uppercase: false,
  });

  useEffect(() => {
    setCriteria({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      uppercase: /[A-Z]/.test(password),
    });
  }, [password]);

  const strengthCount = Object.values(criteria).filter(Boolean).length;
  
  const getStrengthLabel = () => {
    if (password.length === 0) return { label: "", color: "bg-muted" };
    if (strengthCount <= 1) return { label: "Weak", color: "bg-red-500" };
    if (strengthCount <= 3) return { label: "Medium", color: "bg-orange-500" };
    return { label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (strengthCount < 3) {
      setError("Please choose a stronger password.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", name);
      formData.append("email", email);
      formData.append("hashed_password", password);
      formData.append("role", "patient");

      const response = await authApi.register(formData);
      if (response.data) {
        dispatch(setUser(response.data));
      }
      toast.success("Successfully registered account.");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
              Start your journey to clarity
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-emerald-200/80 text-sm leading-relaxed"
            >
              Join thousands of patients who use our navigator to track health issues, compile summaries, and prepare for medical appointments.
            </motion.p>
          </div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 text-sm">
              <div className="h-5 w-5 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Check className="h-3 w-3" />
              </div>
              <span>24/7 AI-driven symptom analysis summaries</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-5 w-5 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Check className="h-3 w-3" />
              </div>
              <span>Exportable clinician-ready PDF briefing sheets</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-5 w-5 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Check className="h-3 w-3" />
              </div>
              <span>Double-encrypted private clinical search vaults</span>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-emerald-400/60 z-10">
          © {new Date().getFullYear()} HealthNavigator. Verified HIPAA Secure.
        </p>
      </div>

      {/* Right Column: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px] my-6"
        >
          <Card className="border-border bg-card/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Header top colored bar */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />

            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
                <Link to="/" className="lg:hidden text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </Link>
              </div>
              <CardDescription>
                Sign up today to manage your clinical profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-xs text-destructive font-medium">
                    {error}
                  </div>
                )}

                {/* Name field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 focus-visible:ring-emerald-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password">Password</Label>
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

                  {/* Password Strength Indicator Visual */}
                  {password.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className="font-bold text-foreground">{strength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full rounded-full transition-colors ${
                              step <= strengthCount ? strength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {criteria.length ? (
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          <span>Min 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {criteria.uppercase ? (
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          <span>1 Uppercase letter</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {criteria.number ? (
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          <span>1 Number</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {criteria.special ? (
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          <span>1 Special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 focus-visible:ring-emerald-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Agree to terms */}
                <div className="flex items-start space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-input text-emerald-600 focus:ring-emerald-500 mt-1"
                  />
                  <label htmlFor="agree" className="text-xs text-muted-foreground cursor-pointer select-none leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                      Terms of Service
                    </a>{" "}
                    and understand how my data is stored under the HIPAA Privacy Rules.
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
                    "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center border-t border-border/80 bg-muted/10 py-4">
              <span className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Log in
                </Link>
              </span>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
