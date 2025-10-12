// Minimal, solid fetch wrapper that works in prod (Hosting) and dev (emulators)

const DEV_BASE =
  import.meta.env.VITE_API_BASE2 /* e.g. http://127.0.0.1:5001/f15-internal/us-central1/api */
  || '/api';

export const API_BASE =
  import.meta.env.PROD ? '/api' : DEV_BASE;

type Json = unknown;

async function asJSON<T = Json>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any;
  try { json = text ? JSON.parse(text) : {}; } catch { throw new Error(text || 'Non-JSON response'); }
  if (!res.ok) {
    const msg = json?.error ? `${res.status} ${res.statusText}: ${JSON.stringify(json)}` : `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return json as T;
}

function buildInit(method: string, body?: unknown): RequestInit {
  const init: RequestInit = {
    method,
    credentials: 'include',               // <-- send/receive cookies
    headers: { 'Content-Type': 'application/json' }
  };
  if (body !== undefined) (init as any).body = JSON.stringify(body);
  return init;
}

function absolute(path: string) {
  return path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function getJSON<T = Json>(path: string): Promise<T> {
  const res = await fetch(absolute(path), buildInit('GET'));
  return asJSON<T>(res);
}
export async function postJSON<T = Json>(path: string, body: unknown): Promise<T> {
  const res = await fetch(absolute(path), buildInit('POST', body));
  return asJSON<T>(res);
}
export async function patchJSON<T = Json>(path: string, body: unknown): Promise<T> {
  const res = await fetch(absolute(path), buildInit('PATCH', body));
  return asJSON<T>(res);
}
export async function delJSON<T = Json>(path: string): Promise<T> {
  const res = await fetch(absolute(path), buildInit('DELETE'));
  return asJSON<T>(res);
}

const api = { API_BASE, getJSON, postJSON, patchJSON, delJSON };
export default api;
