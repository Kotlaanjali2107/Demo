import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updateProfile, 
  updatePassword,
  deleteUser,
  onAuthStateChanged,
  type User,
  type AuthError
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Web app's Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyChP6rKDl0JPqsuYUjGwflpKANGNR7464g",
  authDomain: "fir-6a530.firebaseapp.com",
  projectId: "fir-6a530",
  storageBucket: "fir-6a530.firebasestorage.app",
  messagingSenderId: "938679741602",
  appId: "1:938679741602:web:cc113854c306ab05a1bbfb",
  measurementId: "G-VN95BBH735"
};

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Optional Analytics initialization in browser
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch (err) {
        console.warn("Analytics not initialized:", err);
      }
    }
  }).catch(() => {
    // Ignore analytics unsupported environment
  });
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Maps Firebase Auth error codes to user-friendly error messages and troubleshooting hints.
 */
export function formatAuthError(error: unknown): { message: string; code?: string; troubleshooting?: string } {
  if (!error || typeof error !== "object") {
    return { message: "An unexpected error occurred. Please try again." };
  }

  const authErr = error as AuthError;
  const code = authErr.code || "";

  switch (code) {
    case "auth/email-already-in-use":
      return {
        code,
        message: "This email address is already in use by another account.",
        troubleshooting: "If you already registered, please sign in instead, or use the 'Forgot Password' link to reset your credentials."
      };
    case "auth/invalid-email":
      return {
        code,
        message: "The email address is not formatted correctly.",
        troubleshooting: "Please double check the spelling of your email address (e.g., user@domain.com)."
      };
    case "auth/operation-not-allowed":
      return {
        code,
        message: "Email/Password sign-in is not enabled in your Firebase Console project.",
        troubleshooting: `To fix this: Open your Firebase Console for project 'fir-6a530' > Authentication > Sign-in method, click 'Email/Password' and switch it to 'Enable'.`
      };
    case "auth/weak-password":
      return {
        code,
        message: "The password is too weak.",
        troubleshooting: "Please use at least 6 characters. For better security, include upper and lowercase letters, numbers, and symbols."
      };
    case "auth/user-disabled":
      return {
        code,
        message: "This account has been disabled by an administrator.",
        troubleshooting: "Please contact support if you believe this was done in error."
      };
    case "auth/user-not-found":
      return {
        code,
        message: "No account found with this email address.",
        troubleshooting: "Please check your email address or click 'Create Account' to register."
      };
    case "auth/wrong-password":
      return {
        code,
        message: "Incorrect password entered.",
        troubleshooting: "Please check your caps lock and try again, or use 'Forgot password' to reset it."
      };
    case "auth/invalid-credential":
      return {
        code,
        message: "Invalid email or password.",
        troubleshooting: "Please verify that your email and password are typed correctly."
      };
    case "auth/too-many-requests":
      return {
        code,
        message: "Access to this account has been temporarily disabled due to many failed login attempts.",
        troubleshooting: "You can immediately restore access by resetting your password, or wait a few minutes and try again."
      };
    case "auth/unauthorized-domain":
      return {
        code,
        message: "This domain is not authorized for Firebase Auth operations.",
        troubleshooting: `Add '${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}' to Authorized Domains in Firebase Console > Authentication > Settings > Authorized domains.`
      };
    case "auth/popup-closed-by-user":
      return {
        code,
        message: "The Google sign-in popup was closed before completion.",
        troubleshooting: "Please click 'Sign in with Google' again and keep the window open until authentication finishes."
      };
    case "auth/popup-blocked":
      return {
        code,
        message: "The authentication pop-up was blocked by your browser.",
        troubleshooting: "Please enable pop-ups in your browser address bar and try again."
      };
    case "auth/requires-recent-login":
      return {
        code,
        message: "This sensitive security action requires a fresh login.",
        troubleshooting: "Please sign out and sign back in to verify your identity before performing this action."
      };
    case "auth/network-request-failed":
      return {
        code,
        message: "Network request failed. Please check your internet connection.",
        troubleshooting: "Ensure you are online and any ad-blockers or firewalls aren't blocking *.firebaseapp.com or *.googleapis.com."
      };
    default:
      return {
        code,
        message: authErr.message || "An authentication error occurred. Please try again.",
        troubleshooting: code ? `Firebase error code: ${code}` : undefined
      };
  }
}

export {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  onAuthStateChanged,
  type User
};
