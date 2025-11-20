// src/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  type FirebaseUser,
} from '../firebase';

type AuthContextValue = {
  user: FirebaseUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<FirebaseUser>;
  signin: (email: string, password: string) => Promise<FirebaseUser>;
  signout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signup = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const signin = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const signout = async () => {
    await fbSignOut(auth);
    setUser(null);
  };

  const value: AuthContextValue = { user, loading, signup, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
