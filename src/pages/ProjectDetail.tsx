
import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getJSON, postJSON } from '../lib/api'
import type { Project, Task, InventoryItem, MarketingPost, Invoice } from '../types'

const TABS = ['details','tasks','equipment','marketing','invoicing'] as const
type Tab = typeof TABS[number]

export default function ProjectDetail() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'details'
  const [project, setProject] = useState<Project | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getJSON<{project: Project}>(`/projects/${id}`).then(res => setProject(res.project)).catch(e => setErr(String(e)))
  }, [id])

  const setTab = (t:Tab) => { params.set('tab', t); setParams(params, { replace:true }) }

  if (err) return <div className="shell"><p style={{ color:'crimson' }}>{err}</p></div>
  if (!project) return <div className="shell"><p>Loading...</p></div>

  return (
    <div className="shell grid">
      <h2>{project.name}</h2>
      <div className="tabs">
        {TABS.map(t => (
          <div key={t} className={'tab ' + (tab===t ? 'active' : '')} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</div>
        ))}
      </div>
      {tab === 'details' && <DetailsTab project={project} />}
      {tab === 'tasks' && <TasksTab projectId={project.id} />}
      {tab === 'equipment' && <EquipmentTab projectId={project.id} />}
      {tab === 'marketing' && <MarketingTab projectId={project.id} />}
      {tab === 'invoicing' && <InvoicingTab projectId={project.id} />}
    </div>
  )
}

function DetailsTab({ project }: { project: Project }) {
  return (
    <div className="grid">
      <div className="card">
        <h3>Overview</h3>
        <p>{project.description || <span className="muted">No description</span>}</p>
        <div className="row">
          {project.startDate && <div><div className="muted">Start</div><div>{new Date(project.startDate).toLocaleDateString()}</div></div>}
          {project.endDate && <div><div className="muted">End</div><div>{new Date(project.endDate).toLocaleDateString()}</div></div>}
          {project.dueDate && <div><div className="muted">Due</div><div>{new Date(project.dueDate).toLocaleDateString()}</div></div>}
        </div>
      </div>
      <div className="card">
        <h3>Team</h3>
        {!project.teamMembers?.length ? <p className="muted">No team assigned</p> : (
          <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {project.teamMembers!.map(m => (
              <div key={m.userId} className="row">
                <img src={m.photoURL || 'https://placehold.co/40'} alt="" style={{ width:40, height:40, borderRadius:20 }}/>
                <div>
                  <div>{m.displayName}</div>
                  <div className="muted">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <h3>Locations</h3>
        {!project.locations?.length ? <p className="muted">No locations</p> : (
          <ul>{project.locations!.map((l,i) => <li key={i}><strong>{l.name}</strong>{l.address ? ` — ${l.address}` : ''}</li>)}</ul>
        )}
      </div>
    </div>
  )
}

function TasksTab({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [stage, setStage] = useState<Task['stage']>('Pre-production')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    getJSON<{tasks: Task[]}>(`/projects/${projectId}/tasks`)
      .then(res => setTasks(res.tasks)).catch(e => setErr(String(e)))
  }, [projectId])

  async function addTask() {
    try {
      const res = await postJSON<{ task: Task }>(`/projects/${projectId}/tasks`, { title, stage, dueDate })
      setTasks(prev => [res.task, ...prev]); setTitle(''); setDueDate(''); setStage('Pre-production')
    } catch (e:any) { setErr(String(e)) }
  }

  async function toggle(t: Task) {
    try {
      const res = await postJSON<{ task: Task }>(`/projects/${projectId}/tasks/${t.id}`, { status: t.status === 'Done' ? 'Open' : 'Done' })
      setTasks(prev => prev.map(x => x.id===t.id ? res.task : x))
    } catch (e:any) { setErr(String(e)) }
  }

  const group = (stage: Task['stage']) => tasks.filter(t => t.stage === stage)

  return (
    <div className="grid">
      <div className="card grid" style={{ gridTemplateColumns:'1fr 220px 180px auto', alignItems:'end' }}>
        <div><label>Task</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title"/></div>
        <div><label>Stage</label>
          <select value={stage} onChange={e=>setStage(e.target.value as any)}>
            <option>Pre-production</option><option>Production</option><option>Post-production</option>
          </select>
        </div>
        <div><label>Due</label><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} /></div>
        <div><button className="btn primary" onClick={addTask} disabled={!title}>Add</button></div>
      </div>

      {(['Pre-production','Production','Post-production'] as Task['stage'][]).map(s => (
        <div key={s} className="card">
          <h3>{s}</h3>
          {!group(s).length ? <p className="muted">No tasks</p> : (
            <ul>
              {group(s).map(t => (
                <li key={t.id} className="row" style={{ justifyContent:'space-between' }}>
                  <span>
                    <input type="checkbox" checked={t.status==='Done'} onChange={()=>toggle(t)} />{' '}
                    {t.title} {t.dueDate ? <span className="muted">— due {new Date(t.dueDate).toLocaleDateString()}</span> : null}
                  </span>
                  <span className="pill">{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function EquipmentTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    getJSON<{items: InventoryItem[]}>(`/projects/${projectId}/equipment`)
      .then(res => setItems(res.items)).catch(e => setErr(String(e)))
  }, [projectId])

  return (
    <div className="card">
      <h3>Assigned Equipment</h3>
      {err && <p style={{ color:'crimson' }}>{err}</p>}
      {!items.length ? <p className="muted">No equipment assigned</p> : (
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Rental/day</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}><td>{i.name}</td><td>{i.category}</td><td>{i.status}</td><td>{i.rentalPricePerDay ? `$${i.rentalPricePerDay.toFixed(2)}` : '-'}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function MarketingTab({ projectId }: { projectId: string }) {
  const [posts, setPosts] = useState<MarketingPost[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    getJSON<{posts: MarketingPost[]}>(`/projects/${projectId}/marketing`)
      .then(res => setPosts(res.posts)).catch(e => setErr(String(e)))
  }, [projectId])

  return (
    <div className="card">
      <h3>Marketing Schedule</h3>
      {err && <p style={{ color:'crimson' }}>{err}</p>}
      {!posts.length ? <p className="muted">No posts yet</p> : (
        <table>
          <thead><tr><th>Copy</th><th>Platforms</th><th>Status</th><th>When</th></tr></thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id}>
                <td style={{ maxWidth: 440 }}>{p.copy}</td>
                <td>{p.platforms.join(', ')}</td>
                <td>{p.status}</td>
                <td>{p.scheduledAt ? new Date(p.scheduledAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function InvoicingTab({ projectId }: { projectId: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    getJSON<{invoices: Invoice[]}>(`/projects/${projectId}/invoices`)
      .then(res => setInvoices(res.invoices)).catch(e => setErr(String(e)))
  }, [projectId])

  const total = invoices.reduce((a,b) => a + (b.total||0), 0)

  return (
    <div className="card">
      <h3>Invoices</h3>
      {err && <p style={{ color:'crimson' }}>{err}</p>}
      {!invoices.length ? <p className="muted">No invoices</p> : (
        <table>
          <thead><tr><th>#</th><th>Status</th><th>Due</th><th>Total</th></tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.number}</td>
                <td className={`status-${inv.status}`}>{inv.status}</td>
                <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                <td>${inv.total.toFixed(2)}</td>
              </tr>
            ))}
            <tr><td colSpan={3}><strong>Total</strong></td><td><strong>${total.toFixed(2)}</strong></td></tr>
          </tbody>
        </table>
      )}
    </div>
  )
}
