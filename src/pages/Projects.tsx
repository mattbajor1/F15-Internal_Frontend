
import { useEffect, useState } from 'react'
import { getJSON, postJSON } from '../lib/api'
import { Link } from 'react-router-dom'
import type { Project } from '../types'

export default function Projects() {
  const [items, setItems] = useState<Project[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<Project['status']>('Planning')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    getJSON<{projects: Project[]}>('/api/projects')
      .then(res => setItems(res.projects))
      .catch(e => setErr(String(e)))
  }, [])

  async function createProject() {
    try {
      const res = await postJSON<{project: Project}>('/api/projects', { name, status, dueDate })
      setItems(prev => [res.project, ...prev])
      setName(''); setDueDate(''); setStatus('Planning')
    } catch (e:any) {
      setErr(String(e))
    }
  }

  return (
    <div className="shell grid">
      <h2>Projects</h2>
      <div className="card grid" style={{ gridTemplateColumns: '1fr 200px 200px auto', alignItems:'end' }}>
        <div>
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Project name"/>
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>Planning</option><option>Active</option><option>On Hold</option><option>Complete</option>
          </select>
        </div>
        <div>
          <label>Due date</label>
          <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
        </div>
        <div>
          <button className="btn primary" onClick={createProject} disabled={!name}>Create</button>
        </div>
      </div>

      {!items.length ? <p className="muted">No projects found.</p> : (
        <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {items.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card" style={{ textDecoration:'none', color:'inherit' }}>
              <div className="row" style={{ justifyContent:'space-between' }}>
                <h3 style={{ margin:0 }}>{p.name}</h3>
                <span className="pill">{p.status}</span>
              </div>
              {p.dueDate && <div className="muted">Due {new Date(p.dueDate).toLocaleDateString()}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
