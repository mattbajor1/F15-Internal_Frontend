
import { useEffect, useState } from 'react'
import { getJSON, postJSON } from '../lib/api'

type ProjectLite = { id:string; name:string }
type Doc = { id:string; name:string; url?:string; version?: number }

export default function Documents() {
  const [projects, setProjects] = useState<ProjectLite[]>([])
  const [selected, setSelected] = useState<string>('')
  const [docs, setDocs] = useState<Doc[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    getJSON<{projects: ProjectLite[]}>('/api/projects?view=lite').then(res => setProjects(res.projects)).catch(e => setErr(String(e)))
  }, [])

  async function loadDocs(pid: string) {
    setSelected(pid)
    try{
      const res = await getJSON<{documents: Doc[]}>(`/api/projects/${pid}/documents`)
      setDocs(res.documents)
    } catch(e:any) { setErr(String(e)) }
  }

  async function upload() {
    if (!selected || !file) return
    try {
      const meta = await postJSON<{ uploadUrl:string; storagePath:string }>(`/api/projects/${selected}/documents/upload-url`, {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream'
      })
      await fetch(meta.uploadUrl, { method:'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file })
      await postJSON(`/api/projects/${selected}/documents`, { name: file.name, storagePath: meta.storagePath })
      await loadDocs(selected)
      setFile(null)
    } catch (e:any) {
      setErr(String(e))
    }
  }

  return (
    <div className="shell grid">
      <h2>Document Hub</h2>
      <div className="card row">
        <select value={selected} onChange={e=>loadDocs(e.target.value)}>
          <option value="">Select a project…</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <button className="btn" onClick={upload} disabled={!selected || !file}>Upload</button>
      </div>
      {selected && (
        <div className="card">
          {!docs.length ? <p className="muted">No documents for this project.</p> : (
            <table>
              <thead><tr><th>Name</th><th>Version</th><th>Open</th></tr></thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.version ?? '-'}</td>
                    <td>{d.url ? <a href={d.url} target="_blank">Open</a> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
