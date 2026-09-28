import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Mail, 
  User as UserIcon, 
  Key, 
  Lock, 
  Clock, 
  Calendar, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Camera,
  Server,
  Globe,
  Sparkles,
  Fingerprint
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatAuthError, firebaseConfig } from "../firebase";
import { EmailVerificationBanner } from "./EmailVerificationBanner";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
];

interface DashboardViewProps {
  onOpenConfigModal: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function DashboardView({ onOpenConfigModal, activeTab: externalActiveTab, setActiveTab: setExternalActiveTab }: DashboardViewProps) {
  const { 
    currentUser, 
    reloadUser, 
    sendVerificationEmail, 
    updateUserProfile, 
    updateUserPassword, 
    deleteAccount 
  } = useAuth();

  const [internalTab, setInternalTab] = useState<string>("overview");
  const currentTab = externalActiveTab || internalTab;
  const setTab = setExternalActiveTab || setInternalTab;

  // Profile edit states
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password update states
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Email verification action states
  const [verifSending, setVerifSending] = useState(false);
  const [verifChecking, setVerifChecking] = useState(false);
  const [verifCooldown, setVerifCooldown] = useState(0);
  const [verifFeedback, setVerifFeedback] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Delete account confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Copy indicators
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [idToken, setIdToken] = useState<string>("");

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setPhotoURL(currentUser.photoURL || "");
      currentUser.getIdToken().then(setIdToken).catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    if (verifCooldown <= 0) return;
    const timer = setInterval(() => setVerifCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [verifCooldown]);

  if (!currentUser) return null;

  const handleCopyUid = () => {
    navigator.clipboard.writeText(currentUser.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(idToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      setProfileSaving(true);
      await updateUserProfile(displayName, photoURL);
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      const formatted = formatAuthError(err);
      setProfileMessage({ type: "error", text: formatted.message });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      setPasswordSaving(true);
      await updateUserPassword(newPassword);
      setPasswordMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      const formatted = formatAuthError(err);
      setPasswordMessage({
        type: "error",
        text: formatted.message + (formatted.troubleshooting ? ` (${formatted.troubleshooting})` : "")
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSendVerification = async () => {
    if (verifCooldown > 0 || verifSending) return;
    try {
      setVerifSending(true);
      setVerifFeedback(null);
      await sendVerificationEmail();
      setVerifFeedback({
        type: "success",
        text: `Verification link sent to ${currentUser.email}! Check your inbox and spam folder.`
      });
      setVerifCooldown(60);
    } catch (err) {
      const formatted = formatAuthError(err);
      setVerifFeedback({ type: "error", text: formatted.message });
    } finally {
      setVerifSending(false);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      setVerifChecking(true);
      setVerifFeedback(null);
      const user = await reloadUser();
      if (user?.emailVerified) {
        setVerifFeedback({
          type: "success",
          text: "🎉 Great news! Your email address has been verified!"
        });
      } else {
        setVerifFeedback({
          type: "info",
          text: "Email not verified yet. Please click the link in your email and click refresh again."
        });
      }
    } catch (err) {
      const formatted = formatAuthError(err);
      setVerifFeedback({ type: "error", text: formatted.message });
    } finally {
      setVerifChecking(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm.");
      return;
    }
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteAccount();
      setShowDeleteModal(false);
    } catch (err) {
      const formatted = formatAuthError(err);
      setDeleteError(formatted.message + (formatted.troubleshooting ? ` (${formatted.troubleshooting})` : ""));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Verification Banner if not verified */}
      <EmailVerificationBanner onOpenConfigModal={onOpenConfigModal} />

      {/* Main Profile Header Hero */}
      <div className="relative bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative group">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "User avatar"}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email?.[0].toUpperCase() || "U"}
                </div>
              )}
              <button
                onClick={() => setTab("profile")}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 shadow-md transition"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name & Credentials */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentUser.displayName || "Authenticated User"}
                </h1>
                {/* Verified badge */}
                {currentUser.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" /> Unverified Email
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 font-mono">
                {currentUser.email}
              </p>

              {/* UID chip */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                <span className="font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[200px] sm:max-w-none">
                  UID: {currentUser.uid}
                </span>
                <button
                  onClick={handleCopyUid}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                  title="Copy UID"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick status counters / action */}
          <div className="flex flex-row md:flex-col gap-3 justify-between md:items-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            <div className="text-left md:text-right">
              <div className="text-xs text-slate-400">Auth Providers</div>
              <div className="flex items-center gap-1.5 mt-1">
                {currentUser.providerData.map((p) => (
                  <span
                    key={p.providerId}
                    className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-200 border border-slate-700"
                  >
                    {p.providerId === "password" ? "password" : p.providerId === "google.com" ? "Google" : p.providerId}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-xs text-slate-400">Firebase Project</div>
              <div className="text-xs font-mono font-semibold text-amber-300">
                {firebaseConfig.projectId}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Identity", icon: Fingerprint },
            { id: "verification", label: "Email Verification", icon: Mail },
            { id: "profile", label: "Profile & Password", icon: Lock },
            { id: "diagnostics", label: "Firebase Diagnostics", icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview & Identity */}
      {currentTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Account Metadata Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Account Metadata &amp; Timestamps
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Account Created</span>
                <span className="font-medium text-slate-200">{formatDate(currentUser.metadata.creationTime)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Last Sign-in</span>
                <span className="font-medium text-slate-200">{formatDate(currentUser.metadata.lastSignInTime)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Verification Status</span>
                <span className={`font-semibold ${currentUser.emailVerified ? "text-emerald-400" : "text-amber-400"}`}>
                  {currentUser.emailVerified ? "Verified (Clean)" : "Unverified (Pending)"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Anonymous Account</span>
                <span className="font-medium text-slate-200">{currentUser.isAnonymous ? "Yes" : "No (Registered)"}</span>
              </div>
            </div>
          </div>

          {/* Session Token & Security State */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                <Key className="w-4 h-4 text-amber-400" />
                Active Session &amp; ID Token
              </h3>
              <button
                onClick={handleCopyToken}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? "Copied" : "Copy Token"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Firebase Auth automatically manages cryptographically signed JWT tokens with 1-hour expiration and automatic silent background refreshes.
            </p>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 break-all max-h-28 overflow-y-auto">
              {idToken || "Loading JWT Token..."}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={async () => {
                  if (currentUser) {
                    const token = await currentUser.getIdToken(true);
                    setIdToken(token);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
              >
                <RefreshCw className="w-3 h-3 text-indigo-400" />
                <span>Force Refresh Token</span>
              </button>
              <span className="text-[11px] text-slate-500">Algorithm: RS256</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Email Verification Center */}
      {currentTab === "verification" && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${currentUser.emailVerified ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Email Verification Center</h2>
              <p className="text-xs text-slate-400">
                Manage, dispatch, and test Firebase Auth email verification links.
              </p>
            </div>
          </div>

          {/* Verification Status Card */}
          <div className={`p-5 rounded-2xl border ${
            currentUser.emailVerified 
              ? "bg-emerald-950/40 border-emerald-500/30" 
              : "bg-amber-950/30 border-amber-500/30"
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-base">
                    {currentUser.emailVerified ? "Your Email Is Verified" : "Verification Required"}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                    currentUser.emailVerified 
                      ? "bg-emerald-500/20 text-emerald-300" 
                      : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {currentUser.emailVerified ? "VERIFIED" : "PENDING"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Target Email: <strong className="text-white font-mono">{currentUser.email}</strong>
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  Emails are sent directly from Firebase infrastructure: <code className="text-indigo-300 font-mono">noreply@{firebaseConfig.authDomain}</code>
                </p>
              </div>
            </div>

            {/* Actions for verification */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={handleSendVerification}
                disabled={verifSending || verifCooldown > 0}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifCooldown > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Resend in {verifCooldown}s</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{verifSending ? "Sending..." : "Send Verification Email"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRefreshStatus}
                disabled={verifChecking}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifChecking ? "animate-spin" : ""}`} />
                <span>{verifChecking ? "Checking..." : "Refresh Verification Status"}</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {verifFeedback && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
              verifFeedback.type === "success" 
                ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-200" 
                : verifFeedback.type === "error" 
                ? "bg-rose-950/60 border border-rose-500/30 text-rose-200" 
                : "bg-slate-900 border border-slate-700 text-slate-300"
            }`}>
              {verifFeedback.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {verifFeedback.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              {verifFeedback.type === "info" && <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
              <div>{verifFeedback.text}</div>
            </div>
          )}

          {/* Steps & Guidance */}
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">How Verification Works</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-indigo-400">Step 1: Link Sent</span>
                <p className="text-slate-400">Firebase Auth sends a cryptographically signed link to your inbox.</p>
              </div>
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-indigo-400">Step 2: Click Link</span>
                <p className="text-slate-400">Clicking the link in your email marks your account as verified in Firebase.</p>
              </div>
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="font-bold text-indigo-400">Step 3: Refresh Here</span>
                <p className="text-slate-400">Click &quot;Refresh Verification Status&quot; to reload your session token.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Profile & Password Settings */}
      {currentTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Profile Name & Avatar Form */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                Profile Information
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your public display name and avatar photo.
              </p>
            </div>

            {profileMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                profileMessage.type === "success" 
                  ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-200" 
                  : "bg-rose-950/60 border border-rose-500/30 text-rose-200"
              }`}>
                {profileMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Or pick a preset avatar:
                </label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {AVATAR_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPhotoURL(preset)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition ${
                        photoURL === preset ? "border-indigo-500 scale-105" : "border-slate-800 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={preset} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {profileSaving ? "Saving changes..." : "Save Profile Changes"}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-amber-400" />
                Change Password
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set a new password for your Firebase Auth account.
              </p>
            </div>

            {passwordMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMessage.type === "success" 
                  ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-200" 
                  : "bg-rose-950/60 border border-rose-500/30 text-rose-200"
              }`}>
                {passwordMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                🔒 If you haven&apos;t logged in recently, Firebase may require you to re-authenticate before modifying sensitive credentials.
              </div>

              <button
                type="submit"
                disabled={passwordSaving || !newPassword}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {passwordSaving ? "Updating password..." : "Update Password"}
              </button>
            </form>

            {/* Danger Zone: Delete Account */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-rose-400">Delete Account</div>
                  <div className="text-[11px] text-slate-500">Permanently delete your user credentials.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-medium rounded-xl border border-rose-900/50 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Firebase Diagnostics */}
      {currentTab === "diagnostics" && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                Firebase Project Diagnostics &amp; Console Status
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time configuration values connected to your Firebase app.
              </p>
            </div>
            <button
              onClick={onOpenConfigModal}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
            >
              Open Setup Checklist
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">Project ID</span>
              <div className="font-mono font-semibold text-amber-300 truncate">{firebaseConfig.projectId}</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">Auth Domain</span>
              <div className="font-mono text-slate-200 truncate">{firebaseConfig.authDomain}</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">App ID</span>
              <div className="font-mono text-slate-200 truncate">{firebaseConfig.appId}</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">Sender ID</span>
              <div className="font-mono text-slate-200 truncate">{firebaseConfig.messagingSenderId}</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">Current Hostname</span>
              <div className="font-mono text-slate-200 truncate">{typeof window !== "undefined" ? window.location.hostname : "localhost"}</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">Storage Bucket</span>
              <div className="font-mono text-slate-200 truncate">{firebaseConfig.storageBucket}</div>
            </div>
          </div>

          {/* Quick links */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition"
            >
              <span>Firebase Console Users</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition"
            >
              <span>Sign-in Providers</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/emails`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition"
            >
              <span>Email Templates (Customize Link)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Permanently Delete Account?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will immediately delete your Firebase Auth record for <strong className="text-white">{currentUser.email}</strong>. This action is irreversible.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded-xl text-xs text-rose-200">
                {deleteError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Type <strong className="text-white font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== "DELETE"}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
