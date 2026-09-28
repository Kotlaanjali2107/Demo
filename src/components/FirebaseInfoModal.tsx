import React, { useState } from "react";
import { 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  X, 
  KeyRound, 
  Mail, 
  Globe 
} from "lucide-react";
import { firebaseConfig } from "../firebase";

interface FirebaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirebaseInfoModal({ isOpen, onClose }: FirebaseInfoModalProps) {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(firebaseConfig, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Firebase Auth Setup &amp; Configuration</h2>
            <p className="text-sm text-slate-400">Project: <span className="font-mono text-amber-300 font-semibold">{firebaseConfig.projectId}</span></p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          {/* Email Verification Section */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Email Verification In Firebase</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              When a user signs up or requests verification, Firebase Auth dispatches an email containing a secure one-time verification link from <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">noreply@{firebaseConfig.authDomain}</code>.
            </p>
            <div className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              💡 <strong>Tip:</strong> If testing in your own inbox, check your <em>Spam or Junk</em> folder if the email doesn&apos;t appear in your Primary inbox within 30 seconds.
            </div>
          </div>

          {/* Quick Firebase Console Checklist */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Firebase Console Checklist for <span className="font-mono text-indigo-300">fir-6a530</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <div className="font-medium text-slate-200">Enable Email/Password Provider</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    In Firebase Console &rarr; <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong>, ensure <strong>Email/Password</strong> is set to <em>Enabled</em>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                <div className="w-full">
                  <div className="font-medium text-slate-200">Authorized Domains</div>
                  <p className="text-xs text-slate-400 mt-0.5 mb-2">
                    Firebase requires domain authorization for popup sign-ins and email handlers:
                  </p>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-300">
                    <div className="flex items-center gap-2 truncate">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{currentHostname || "localhost"}</span>
                    </div>
                    <button
                      onClick={handleCopyDomain}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition shrink-0"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? "Copied" : "Copy Domain"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Add this to Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Config */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-300 text-xs uppercase tracking-wider">Active Configuration</span>
              <button
                onClick={handleCopyConfig}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedConfig ? "Copied" : "Copy JSON"}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-400 overflow-x-auto max-h-36">
              {JSON.stringify(firebaseConfig, null, 2)}
            </pre>
          </div>

          {/* Firebase Console Direct Links */}
          <div className="pt-2 flex flex-wrap gap-2">
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-sm transition"
            >
              <span>Open Firebase Users Console</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
