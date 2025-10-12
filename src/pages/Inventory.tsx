
import { useEffect, useState } from 'react'
import { getJSON, postJSON } from '../lib/api'
import type { InventoryItem } from '../types'

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [err, setErr] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Camera')
  const [status, setStatus] = useState<InventoryItem['status']>('Available')
  const [nextMaintenance, setNextMaintenance] = useState('')
  const [rental, setRental] = useState('')

  async function refresh() {
    try {
      const res = await getJSON<{items: InventoryItem[]}>('/inventory')
      setItems(res.items)
    } catch (e:any) {
      setErr(String(e))
    }
  }

  useEffect(() => { refresh() }, [])

  async function add() {
    try {
      const payload:any = { name, category, status }
      if (nextMaintenance) payload.nextMaintenance = nextMaintenance
      if (rental) payload.rentalPricePerDay = parseFloat(rental)
      await postJSON('/api/inventory', payload)
      setName(''); setCategory('Camera'); setStatus('Available'); setNextMaintenance(''); setRental('')
      refresh()
    } catch (e:any) { setErr(String(e)) }
  }

  return (
    <div className="shell grid">
      <h2>Inventory</h2>
      <div className="card grid" style={{ gridTemplateColumns:'1fr 180px 180px 180px 140px auto', alignItems:'end' }}>
        <div><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><label>Category</label><input value={category} onChange={e=>setCategory(e.target.value)} /></div>
        <div><label>Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>Available</option><option>In Use</option><option>Maintenance</option>
          </select>
        </div>
        <div><label>Next Maintenance</label><input type="date" value={nextMaintenance} onChange={e=>setNextMaintenance(e.target.value)} /></div>
        <div><label>Rental/day</label><input value={rental} onChange={e=>setRental(e.target.value)} placeholder="e.g. 75" /></div>
        <div><button className="btn primary" onClick={add} disabled={!name}>Add item</button></div>
      </div>

      <div className="card">
        {!items.length ? <p className="muted">No equipment yet.</p> : (
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Next Maint.</th><th>Rental/day</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.category}</td>
                  <td>{i.status}</td>
                  <td>{i.nextMaintenance ? new Date(i.nextMaintenance).toLocaleDateString() : '-'}</td>
                  <td>{i.rentalPricePerDay ? `$${i.rentalPricePerDay.toFixed(2)}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
