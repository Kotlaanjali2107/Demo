import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthCard } from "./components/AuthCard";
import { DashboardView } from "./components/DashboardView";
import { FirebaseInfoModal } from "./components/FirebaseInfoModal";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  Key,
  Users
} from "lucide-react";
import { firebaseConfig } from "./firebase";

function MainContent() {
  const { currentUser, loading } = useAuth();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <ShieldCheck className="w-6 h-6 text-amber-400 absolute" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">
          Connecting to Firebase Auth...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar 
        onOpenConfigModal={() => setConfigModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {currentUser ? (
          /* User is Authenticated: Show Management Dashboard */
          <DashboardView 
            onOpenConfigModal={() => setConfigModalOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ) : (
          /* User is Unauthenticated: Show Landing & Auth Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Hero & Explanations */}
            <div className="lg:col-span-7 space-y-6">
              {/* Project Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected to Firebase:</span>
                <span className="font-mono text-amber-300 font-semibold">{firebaseConfig.projectId}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Secure User Auth &amp;{" "}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-400 bg-clip-text text-transparent">
                  Email Verification
                </span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                A complete authentication system built with Firebase Auth. Register accounts, receive cryptographic email verification links, sign in securely, and manage credentials with complete peace of mind.
              </p>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5 hover:border-slate-700 transition">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Automated Email Verification</h3>
                  <p className="text-xs text-slate-400">
                    Dispatches verification links via Firebase from <code className="text-amber-300">noreply@{firebaseConfig.authDomain}</code>.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5 hover:border-slate-700 transition">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Real-time Password Strength</h3>
                  <p className="text-xs text-slate-400">
                    Live character, case, number, and symbol evaluation to ensure secure credentials.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5 hover:border-slate-700 transition">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">JWT Tokens &amp; Password Reset</h3>
                  <p className="text-xs text-slate-400">
                    Self-service password recovery links and background session refresh out of the box.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5 hover:border-slate-700 transition">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">User Management Center</h3>
                  <p className="text-xs text-slate-400">
                    Profile customization, avatar selection, session diagnostics, and account deletion.
                  </p>
                </div>
              </div>

              {/* Troubleshooting helper bar */}
              <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Configured with project <strong className="text-slate-200">{firebaseConfig.projectId}</strong></span>
                </div>
                <button
                  onClick={() => setConfigModalOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                >
                  <span>View Console Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Auth Card */}
            <div className="lg:col-span-5">
              <AuthCard 
                initialMode="register" 
                onOpenConfigModal={() => setConfigModalOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built with <strong>Firebase Authentication</strong> &bull; Project ID: <code className="text-amber-400 font-mono">{firebaseConfig.projectId}</code>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setConfigModalOpen(true)}
              className="hover:text-white transition"
            >
              Setup Guide
            </button>
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Firebase Console &rarr;
            </a>
          </div>
        </div>
      </footer>

      {/* Info & Config Modal */}
      <FirebaseInfoModal 
        isOpen={configModalOpen} 
        onClose={() => setConfigModalOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
