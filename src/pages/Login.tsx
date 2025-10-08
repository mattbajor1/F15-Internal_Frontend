import { signInWithGoogle } from '../firebase'

export default function Login() {
  return (
    <div style={{ display:'grid', placeItems:'center', height:'100vh' }}>
      <div style={{ border:'1px solid #ddd', padding:24, borderRadius:12, width:360 }}>
        <h1>F15 Internal</h1>
        <p>Sign in to continue</p>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      </div>
    </div>
  )
}
