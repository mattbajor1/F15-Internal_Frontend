// src/pages/Login.tsx
import { signInWithGoogle } from '../hooks/useAuth'
import { useState } from 'react'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleClick() {
    setErr(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      // The AuthProvider will pick up the user; your router can redirect accordingly.
      // If you want an immediate redirect here, you can do:
      // window.location.href = '/'
    } catch (e: any) {
      setErr(e?.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <div style={{ border: '1px solid #ddd', padding: 24, borderRadius: 12, width: 360 }}>
        <h1>F15 Internal</h1>
        <p>Sign in to continue</p>
        <button onClick={handleClick} disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
        {err && <p style={{ color: 'crimson', marginTop: 12 }}>{err}</p>}
        <p style={{ marginTop: 12, color: '#666', fontSize: 12 }}>
          Using Firebase <b>Auth Emulator</b> locally. In production this will be real Google OAuth.
        </p>
      </div>
    </div>
  )
}
