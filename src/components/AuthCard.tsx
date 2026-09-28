import React, { useState, useId } from "react";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatAuthError, firebaseConfig } from "../firebase";

type AuthMode = "login" | "register" | "forgot";

interface AuthCardProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  onOpenConfigModal?: () => void;
}

export function AuthCard({ initialMode = "login", onSuccess, onOpenConfigModal }: AuthCardProps) {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ message: string; code?: string; troubleshooting?: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Input IDs for accessibility
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-slate-700" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 20, label: "Weak", color: "bg-rose-500" };
    if (score <= 3) return { score: 60, label: "Moderate", color: "bg-amber-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500" };
  };

  const pwdStrength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword ? password === confirmPassword : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setSuccessMessage(null);

    if (mode === "register") {
      if (password !== confirmPassword) {
        setErrorDetails({ message: "Passwords do not match. Please re-enter them carefully." });
        return;
      }
      if (password.length < 6) {
        setErrorDetails({ message: "Password must be at least 6 characters long." });
        return;
      }
    }

    try {
      setIsLoading(true);

      if (mode === "login") {
        await login(email, password);
        if (onSuccess) onSuccess();
      } else if (mode === "register") {
        await register(email, password, displayName);
        setSuccessMessage("Account created successfully! A verification email has been dispatched.");
        if (onSuccess) onSuccess();
      } else if (mode === "forgot") {
        await resetPassword(email);
        setSuccessMessage(`Password reset link sent to ${email}. Please check your email inbox and spam folder.`);
      }
    } catch (err) {
      const formatted = formatAuthError(err);
      setErrorDetails(formatted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorDetails(null);
    setSuccessMessage(null);
    try {
      setIsLoading(true);
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err) {
      const formatted = formatAuthError(err);
      setErrorDetails(formatted);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container card */}
      <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Tab switch header for Login & Register */}
        {mode !== "forgot" ? (
          <div className="flex p-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorDetails(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                mode === "login"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorDetails(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                mode === "register"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorDetails(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 mb-2 transition"
            >
              &larr; Back to Sign In
            </button>
            <h2 className="text-xl font-bold text-white tracking-tight">Reset Password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your registered email address and we&apos;ll send you a password reset link.
            </p>
          </div>
        )}

        {/* Card Title & Subtitle */}
        {mode !== "forgot" && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === "login" ? "Welcome Back" : "Create an Account"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {mode === "login"
                ? "Sign in to manage your account and verification status."
                : "Register with Firebase Auth. We'll automatically verify your email."}
            </p>
          </div>
        )}

        {/* Error notification alert */}
        {errorDetails && (
          <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/30 rounded-2xl text-xs text-rose-200 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-rose-300">Authentication Error: </span>
                {errorDetails.message}
              </div>
            </div>
            {errorDetails.troubleshooting && (
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-rose-900/40 text-[11px] text-slate-300 space-y-1">
                <div className="font-medium text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Troubleshooting Hint:</span>
                </div>
                <div>{errorDetails.troubleshooting}</div>
                {errorDetails.code === "auth/operation-not-allowed" && (
                  <div className="pt-1">
                    <a
                      href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-medium"
                    >
                      <span>Open Firebase Console &rarr; Providers</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Success notification alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name field (Registration only) */}
          {mode === "register" && (
            <div>
              <label htmlFor={nameId} className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name or Nickname
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id={nameId}
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor={emailId} className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id={emailId}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password field (Login & Register) */}
          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={passwordId} className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorDetails(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live strength meter on register */}
              {mode === "register" && password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-semibold ${pwdStrength.score >= 60 ? "text-emerald-400" : "text-amber-400"}`}>
                      {pwdStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pwdStrength.color} transition-all duration-300`}
                      style={{ width: `${pwdStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password (Register mode) */}
          {mode === "register" && (
            <div>
              <label htmlFor={confirmPasswordId} className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id={confirmPasswordId}
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                    !passwordsMatch && confirmPassword
                      ? "border-rose-500/50 focus:ring-rose-500"
                      : "border-slate-800 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {!passwordsMatch && confirmPassword && (
                <p className="text-[11px] text-rose-400 mt-1">Passwords do not match</p>
              )}
            </div>
          )}

          {/* Email verification reminder in register mode */}
          {mode === "register" && (
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>Automatic Email Verification:</strong> A verification link will be immediately dispatched to your email address upon registration.
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (mode === "register" && (!passwordsMatch || password.length < 6))}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === "login"
                    ? "Sign In"
                    : mode === "register"
                    ? "Create Account & Verify"
                    : "Send Reset Link"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider for 3P Google sign-in */}
        {mode !== "forgot" && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>
        )}

        {/* Google Popup Sign-in */}
        {mode !== "forgot" && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Account</span>
          </button>
        )}

        {/* Card Footer note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            Secured by Firebase Auth &bull; Project ID: <code className="text-slate-400">{firebaseConfig.projectId}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
