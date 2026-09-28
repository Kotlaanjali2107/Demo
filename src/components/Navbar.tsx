import { useState } from "react";
import { 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { firebaseConfig } from "../firebase";

interface NavbarProps {
  onOpenConfigModal: () => void;
  onOpenAuthModal?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function Navbar({ onOpenConfigModal, onOpenAuthModal, activeTab, setActiveTab }: NavbarProps) {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setIsLoggingOut(false);
      setMobileMenuOpen(false);
    }
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 p-0.5 shadow-lg shadow-orange-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                Auth<span className="text-amber-400">Vault</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {firebaseConfig.projectId}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Firebase Auth &bull; Email Verification &bull; User Management
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenConfigModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            title="View Firebase Configuration"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Config</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              {/* Verification status chip */}
              {currentUser.emailVerified ? (
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  title="Your email address has been verified!"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email Verified</span>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab && setActiveTab("verification")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition animate-pulse"
                  title="Click to verify email"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Verify Email</span>
                </button>
              )}

              {/* User Avatar & Name */}
              <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "User avatar"}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center">
                    {getInitials(currentUser.displayName, currentUser.email)}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                    {currentUser.displayName || currentUser.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-300 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 rounded-lg transition disabled:opacity-50"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-900">
            <span>Project: <strong className="text-amber-400">{firebaseConfig.projectId}</strong></span>
            <button
              onClick={() => {
                onOpenConfigModal();
                setMobileMenuOpen(false);
              }}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Config Info</span>
            </button>
          </div>

          {currentUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "User avatar"}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-sm flex items-center justify-center">
                    {getInitials(currentUser.displayName, currentUser.email)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-white text-sm">
                    {currentUser.displayName || "User"}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                  <div className="mt-1">
                    {currentUser.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <AlertTriangle className="w-3 h-3" /> Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {setActiveTab && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-lg text-xs font-medium text-left border ${
                      activeTab === "profile"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-300 border-slate-800"
                    }`}
                  >
                    Profile &amp; Settings
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("verification");
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-lg text-xs font-medium text-left border ${
                      activeTab === "verification"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-300 border-slate-800"
                    }`}
                  >
                    Email Verification
                  </button>
                </div>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded-xl hover:bg-rose-950/50 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}
