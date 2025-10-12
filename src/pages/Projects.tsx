// src/pages/Projects.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api'; // <- uses VITE_API_BASE2 and sends cookies

type Project = {
  id: string;
  name: string;
  description?: string;
  status?: 'planning' | 'active' | 'paused' | 'completed';
  createdAt?: any;
  updatedAt?: any;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('planning');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await api.getJSON<{ projects: Project[] }>('/projects');
      setProjects(data.projects ?? []);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Please enter a project name.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const created = await api.postJSON<Project>('/projects', {
        name: name.trim(),
        description: description.trim(),
        status,
      });

      setProjects((prev) => [created, ...prev]);
      setName('');
      setDescription('');
      setStatus('planning');
      setShowForm(false);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Projects</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            marginTop: 16,
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 16,
            display: 'grid',
            gap: 12,
          }}
        >
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Name *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              required
              style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
              rows={3}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, maxWidth: 220 }}>
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ padding: '8px 14px', borderRadius: 8, cursor: 'pointer', background: '#f3f4f6' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {err && <p style={{ color: 'crimson', marginTop: 12 }}>{err}</p>}

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <p>Loading…</p>
        ) : projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            {projects.map((p) => (
              <li key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.description && <div style={{ color: '#6b7280', marginTop: 4 }}>{p.description}</div>}
                    {p.status && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>Status: {p.status}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link to={`/projects/${p.id}`}>Open</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
