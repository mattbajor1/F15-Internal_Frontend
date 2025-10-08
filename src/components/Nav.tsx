
import { Link, useLocation } from 'react-router-dom'
import { logout } from '../firebase'

export default function Nav() {
  const { pathname } = useLocation()
  const link = (to:string, label:string) => (
    <Link to={to} style={{ fontWeight: pathname===to ? 700 : 400 }}>{label}</Link>
  )
  return (
    <nav style={{ display:'flex', gap:16, padding:12, borderBottom:'1px solid #eee', background:'#fff', position:'sticky', top:0, zIndex:10 }}>
      {link('/', 'Dashboard')}
      {link('/projects', 'Projects')}
      {link('/inventory', 'Inventory')}
      {link('/documents', 'Documents')}
      {link('/marketing/assistant', 'AI Marketing')}
      <span style={{ marginLeft:'auto' }}><button className="btn" onClick={logout}>Log out</button></span>
    </nav>
  )
}
