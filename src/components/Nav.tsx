import { Link } from 'react-router-dom'
import { watchAuth, logout } from '../hooks/useAuth'

export default function Nav() {
  return (
    <nav style={{ display:'flex', gap:12, padding:12, borderBottom:'1px solid #eee', alignItems:'center' }}>
      <Link to="/">Dashboard</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/inventory">Inventory</Link>
      <Link to="/documents">Documents</Link>
      <Link to="/ai">AI Marketing</Link>
      <div style={{ marginLeft:'auto' }}>
        <button onClick={logout}>Log out</button>
      </div>
    </nav>
  )
}