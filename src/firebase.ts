import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// DEBUG: verify what's actually loaded at runtime
console.log('FIREBASE CONFIG →', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPrefix: (firebaseConfig.apiKey || '').slice(0, 6) // just first 6 chars
})

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  await signInWithPopup(auth, provider)
}

export function watchAuth(cb: (u: User | null)=>void) {
  return onAuthStateChanged(auth, cb)
}

export async function logout() {
  await signOut(auth)
}
