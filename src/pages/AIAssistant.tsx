
import { useState } from 'react'
import { postJSON } from '../lib/api'

export default function AIAssistant() {
  const [projectDetails, setProjectDetails] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [campaignGoals, setCampaignGoals] = useState('')
  const [out, setOut] = useState<string[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true); setErr(null); setOut(null)
    try {
      const res = await postJSON<{ variations: string[] }>('/api/marketing/generate-copy', { projectDetails, targetAudience, campaignGoals })
      setOut(res.variations)
    } catch (e:any) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shell grid">
      <h2>AI Marketing Assistant</h2>
      <div className="card grid" style={{ gridTemplateColumns:'1fr', gap:12 }}>
        <div>
          <label>Project details</label>
          <textarea rows={3} value={projectDetails} onChange={e=>setProjectDetails(e.target.value)} placeholder="What is this project about?" />
        </div>
        <div>
          <label>Target audience</label>
          <input value={targetAudience} onChange={e=>setTargetAudience(e.target.value)} placeholder="Who are we speaking to?" />
        </div>
        <div>
          <label>Campaign goals</label>
          <input value={campaignGoals} onChange={e=>setCampaignGoals(e.target.value)} placeholder="What should this achieve?" />
        </div>
        <div>
          <button className="btn primary" onClick={generate} disabled={loading || !projectDetails || !targetAudience || !campaignGoals}>
            {loading ? 'Generating...' : 'Generate copy'}
          </button>
        </div>
      </div>

      {err && <p style={{ color:'crimson' }}>{err}</p>}
      {out && (
        <div className="grid">
          {out.map((v,i) => (<div key={i} className="card"><div>{v}</div></div>))}
        </div>
      )}
    </div>
  )
}
