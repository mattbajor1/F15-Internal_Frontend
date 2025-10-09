import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithGoogle, observeAuth } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If already signed in, bounce to the page they came from (or /)
  useEffect(() => {
    const unsub = observeAuth((user) => {
      if (user) {
        const from = (location.state as any)?.from?.pathname ?? '/';
        navigate(from === '/login' ? '/' : from, { replace: true });
      }
    });
    return unsub;
  }, [navigate, location.state]);

  async function handleGoogleSignIn() {
    try {
      setErr(null);
      setBusy(true);
      await signInWithGoogle(); // creates session cookie via /api/auth/sessionLogin
      // Redirect happens via observeAuth above
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ border: '1px solid #ddd', padding: 24, borderRadius: 12, width: 360 }}>
        <h1 style={{ margin: 0 }}>F15 Internal</h1>
        <p style={{ marginTop: 8, color: '#666' }}>Sign in to continue</p>

        {err && (
          <div style={{ background: '#fee', color: '#900', padding: 10, borderRadius: 8, marginTop: 12 }}>
            {err}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={busy}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: busy ? '#f3f3f3' : '#fff',
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {busy ? 'Signing in…' : 'Sign in with Google'}
        </button>

        <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
          Pop-ups must be allowed for Google sign-in.
        </div>
      </div>
    </div>
  );
}
