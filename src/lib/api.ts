// src/lib/api.ts
import { getAuth } from 'firebase/auth';

/** Figure out the base once. */
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string) ??
  (import.meta.env.VITE_FUNCTIONS_EMULATOR
    ? `${import.meta.env.VITE_FUNCTIONS_EMULATOR}/api`
    : '/api');

// Keep the old name around just in case some files import it.
export const apiBase = API_BASE;

/** Join helper that accepts absolute URLs too. */
export function absolute(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

/** Build a RequestInit with cookies + optional bearer (auto) */
async function buildInit(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<RequestInit> {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  // Add bearer if we have a user (helps during local dev and also fine in prod).
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(/* forceRefresh */ false);
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch {
    // ignore if auth isn't initialized yet
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: 'include', // send/receive __session cookie
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  return init;
}

/** Uniform response handling */
async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
      try {
        const parsed = JSON.parse(detail);
        // try to surface { error: ... }
        throw new Error(`${res.status} ${res.statusText}: ${parsed.error ?? detail}`);
      } catch {
        throw new Error(`${res.status} ${res.statusText}: ${detail}`);
      }
    } catch {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

/** ---------- Public helpers (named) ---------- */
export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(absolute(path), await buildInit('GET'));
  return asJson<T>(res);
}
export const getJson = getJSON; // alias for older imports

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(absolute(path), await buildInit('POST', body));
  return asJson<T>(res);
}

export async function patchJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(absolute(path), await buildInit('PATCH', body));
  return asJson<T>(res);
}

export async function del(path: string): Promise<void> {
  const res = await fetch(absolute(path), await buildInit('DELETE'));
  await asJson<void>(res);
}
export const delJSON = del; // alias for older imports

/** Default export (so imports like `import api from '../lib/api'` still work) */
const api = {
  base: API_BASE,
  absolute,
  getJSON,
  getJson,
  postJSON,
  patchJSON,
  del,
  delJSON,
};
export default api;
