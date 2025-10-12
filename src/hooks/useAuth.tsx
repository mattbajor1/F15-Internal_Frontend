import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import api, { postJSON } from '../lib/api';
import '../firebase'; // ensure Firebase is initialized once

// ---------------- Context types ----------------
type AuthCtxType = {
  user: User | null;
  authReady: boolean;   // true when initial auth check finished
  loading: boolean;     // alias used by some files = !authReady
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

// ---------------- Context ----------------
export const AuthCtx = createContext<AuthCtxType>({
  user: null,
  authReady: false,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

// Keep old name working for legacy imports
export { AuthCtx as AuthContext };

// Expose API base for callers that build absolute URLs
export const API_BASE = api.API_BASE;

// ---------------- Provider ----------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      try {
        if (u) {
          // Exchange ID token for backend session cookie
          const idToken = await u.getIdToken(true);
          await postJSON(`${API_BASE}/auth/sessionLogin`, { idToken });
        }
      } catch (e) {
        console.error('sessionLogin failed', e);
      } finally {
        setAuthReady(true);
      }
    });
    return unsub;
  }, [auth]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // session cookie exchange happens in onAuthStateChanged
  };

  const logout = async () => {
    try {
      await postJSON(`${API_BASE}/auth/sessionLogout`, {});
    } catch (e) {
      console.warn('sessionLogout failed (continuing)', e);
    }
    await signOut(auth);
    setUser(null);
  };

  const value = useMemo<AuthCtxType>(
    () => ({
      user,
      authReady,
      loading: !authReady,
      signInWithGoogle,
      logout,
    }),
    [user, authReady]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

// ---------------- Hooks ----------------
export const useAuth = () => useContext(AuthCtx);
export const useUser = () => useContext(AuthCtx).user;
export const useAuthReady = () => useContext(AuthCtx).authReady;

// ---------------- Compatibility helpers ----------------
// Some legacy code imports functions directly rather than via the context.

export function watchAuth(cb: (u: User | null) => void): Unsubscribe {
  const auth = getAuth();
  return onAuthStateChanged(auth, cb);
}

export async function signInWithGoogleDirect(): Promise<void> {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}
export { signInWithGoogleDirect as signInWithGoogle };

export async function logoutDirect(): Promise<void> {
  try {
    await postJSON(`${API_BASE}/auth/sessionLogout`, {});
  } catch (e) {
    console.warn('sessionLogout failed (continuing)', e);
  }
  const auth = getAuth();
  await signOut(auth);
}
export { logoutDirect as logout };
