// src/lib/auth.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { api } from './api';

// -- your firebase config (keep what you already have)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// init
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function observeAuth(callback: (user: any | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Sign in with Google -> create session cookie for our API
export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, provider);
  const idToken = await cred.user.getIdToken(/* forceRefresh */ true);
  await api.sessionLogin(idToken); // sets __session cookie (credentials: 'include')
  return cred.user;
}

// Sign out of Firebase + destroy session cookie on backend
export async function signOutEverywhere() {
  try {
    await api.sessionLogout();
  } finally {
    await signOut(auth);
  }
}