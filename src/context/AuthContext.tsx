import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { 
  auth, 
  googleProvider,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updateProfile, 
  updatePassword,
  deleteUser,
  onAuthStateChanged, 
  type User 
} from "../firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  register: (email: string, password: string, displayName?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = useCallback(async (email: string, password: string, displayName?: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // Update display name if given
    if (displayName?.trim()) {
      await updateProfile(user, {
        displayName: displayName.trim(),
      });
    }

    // Attempt to automatically send email verification
    try {
      await sendEmailVerification(user);
    } catch (verifErr) {
      console.warn("Could not automatically send verification email:", verifErr);
    }

    // Force refresh currentUser representation
    await user.reload();
    setCurrentUser(auth.currentUser);
    return user;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<User> => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await signOut(auth);
  }, []);

  const sendVerificationEmail = useCallback(async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in.");
    }
    await sendEmailVerification(auth.currentUser);
  }, []);

  const reloadUser = useCallback(async (): Promise<User | null> => {
    if (!auth.currentUser) return null;
    await auth.currentUser.reload();
    const updated = auth.currentUser;
    setCurrentUser({ ...updated } as User);
    return updated;
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const updateUserProfile = useCallback(async (displayName: string, photoURL?: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in.");
    }
    await updateProfile(auth.currentUser, {
      displayName: displayName.trim(),
      photoURL: photoURL !== undefined ? photoURL : auth.currentUser.photoURL,
    });
    await auth.currentUser.reload();
    setCurrentUser({ ...auth.currentUser } as User);
  }, []);

  const updateUserPassword = useCallback(async (newPassword: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in.");
    }
    await updatePassword(auth.currentUser, newPassword);
  }, []);

  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in.");
    }
    await deleteUser(auth.currentUser);
    setCurrentUser(null);
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
    reloadUser,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
