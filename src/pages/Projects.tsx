import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Project = {
  id: string;
  name: string;
  status?: string;
  createdAt?: any;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form state
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const { projects } = await api.listProjects();
      setProjects(projects as Project[]);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createProject({
        name: name.trim(),
        description: desc.trim(),
      });
      setName('');
      setDesc('');
      await load();
    } catch (e: any) {
      alert(`Create failed: ${e.message || e}`);
    }
  }

  if (loading) return <div className="p-6">Loading projects…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  return (
    <div className="p-6 space-y-8">
      <form onSubmit={createProject} className="space-y-3">
        <h2 className="text-xl font-semibold">Create new project</h2>
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="border rounded px-3 py-2 w-full"
          placeholder="Description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!name.trim()}
          type="submit"
        >
          Create
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-3">Your projects</h2>
        {projects.length === 0 ? (
          <div className="text-gray-500">No projects yet.</div>
        ) : (
          <div className="grid gap-3">
            {projects.map((p) => (
              <div key={p.id} className="border rounded p-4">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">
                  {p.status ?? 'planning'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}