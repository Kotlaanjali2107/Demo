import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Mail, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatAuthError, firebaseConfig } from "../firebase";

interface EmailVerificationBannerProps {
  onOpenConfigModal?: () => void;
}

export function EmailVerificationBanner({ onOpenConfigModal }: EmailVerificationBannerProps) {
  const { currentUser, sendVerificationEmail, reloadUser } = useAuth();
  
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Timer cooldown logic
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || sending) return;
    try {
      setSending(true);
      setStatusMessage(null);
      await sendVerificationEmail();
      setStatusMessage({
        type: "success",
        text: `Verification link sent to ${currentUser.email}! Check your inbox & spam folder.`
      });
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      const formatted = formatAuthError(err);
      setStatusMessage({
        type: "error",
        text: formatted.message + (formatted.troubleshooting ? ` (${formatted.troubleshooting})` : "")
      });
    } finally {
      setSending(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      setStatusMessage(null);
      const user = await reloadUser();
      if (user?.emailVerified) {
        setStatusMessage({
          type: "success",
          text: "🎉 Congratulations! Your email has been verified successfully."
        });
      } else {
        setStatusMessage({
          type: "info",
          text: "Email not yet verified. Please click the link sent to your email, then refresh again."
        });
      }
    } catch (err) {
      const formatted = formatAuthError(err);
      setStatusMessage({
        type: "error",
        text: formatted.message
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900/80 border-y sm:border sm:rounded-2xl border-amber-500/30 p-4 sm:p-5 mb-6 shadow-xl shadow-amber-950/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side info */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Email Verification Required
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-300 font-medium">
                Pending Verification
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              A verification link was dispatched to <strong className="text-white font-mono">{currentUser.email}</strong>.
              Verify your email to ensure secure account recovery and access all features.
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Sender: <code className="text-amber-300 font-mono">noreply@{firebaseConfig.authDomain}</code> (Check spam/junk if not found)</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20 transition disabled:opacity-50"
            title="Click after you verified in your email inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Checking..." : "I've Verified (Check)"}</span>
          </button>

          <button
            onClick={handleResend}
            disabled={sending || cooldown > 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Resend in {cooldown}s</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sending ? "Sending..." : "Resend Link"}</span>
              </>
            )}
          </button>

          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
              title="Verification Troubleshooting Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Feedback banner */}
      {statusMessage && (
        <div 
          className={`mt-3.5 p-3 rounded-xl text-xs flex items-start gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-200"
              : statusMessage.type === "error"
              ? "bg-rose-950/60 border border-rose-500/30 text-rose-200"
              : "bg-slate-900/80 border border-slate-700 text-slate-300"
          }`}
        >
          {statusMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
          {statusMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
          {statusMessage.type === "info" && <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
          <div className="flex-1">{statusMessage.text}</div>
        </div>
      )}
    </div>
  );
}
