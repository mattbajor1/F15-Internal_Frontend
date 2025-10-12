
import { useEffect, useState } from 'react'
import { getJSON } from '../lib/api'
import type { DashboardData } from '../types'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    getJSON<DashboardData>('/dashboard').then(setData).catch(e => setErr(String(e)))
  }, [])
  if (err) return <div className="shell"><p style={{ color:'crimson' }}>{err}</p></div>
  if (!data) return <div className="shell"><p>Loading...</p></div>
  return (
    <div className="shell grid">
      <h2>Dashboard</h2>
      <div className="row">
        <div className="card"><div className="muted">Active Projects</div><div style={{ fontSize:28 }}>{data.projects}</div></div>
        <div className="card"><div className="muted">Open Tasks</div><div style={{ fontSize:28 }}>{data.tasksOpen}</div></div>
        <div className="card"><div className="muted">% Equipment Available</div><div style={{ fontSize:28 }}>{Math.round(data.equipmentAvailablePct)}%</div></div>
      </div>
      <div className="card">
        <h3>Recent Projects</h3>
        <ul>
          {data.recentProjects.map(p => (
            <li key={p.id}><Link to={`/projects/${p.id}`}>{p.name}</Link> — {p.status}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
