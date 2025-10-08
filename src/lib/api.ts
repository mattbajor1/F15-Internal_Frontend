// src/lib/api.ts
export function apiBase() {
  // Prefer explicit emulator URL from .env
  const emu = import.meta.env.VITE_FUNCTIONS_EMULATOR?.replace(/\/$/, "")
  if (emu) return emu
  // Dev safeguard: if running locally and no env set, default to emulator
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    return "http://127.0.0.1:5001/f15-internal/us-central1"
  }
  // Production (on Hosting): use rewrites /api/** -> function
  return ""
}

async function authHeader(): Promise<HeadersInit> {
  const { auth } = await import("../firebase")
  const u = auth.currentUser
  const h: HeadersInit = { "Content-Type": "application/json" }
  if (u) h["Authorization"] = `Bearer ${await u.getIdToken()}`
  return h
}

export async function getJSON<T>(path: string): Promise<T> {
  const headers = await authHeader()
  const base = apiBase()
  const url = base + path
  console.log("API BASE =", base, "→", url)  // <- debug
  const res = await fetch(url, { headers })
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (!res.ok) throw new Error((json as any)?.error || res.statusText)
    return json as T
  } catch {
    throw new Error(`${res.status} ${res.statusText} from ${url}: ${text.slice(0, 120)}...`)
  }
}

export async function postJSON<T>(path: string, body: any): Promise<T> {
  const headers = await authHeader()
  const base = apiBase()
  const url = base + path
  console.log("API BASE =", base, "→", url)  // <- debug
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) })
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (!res.ok) throw new Error((json as any)?.error || res.statusText)
    return json as T
  } catch {
    throw new Error(`${res.status} ${res.statusText} from ${url}: ${text.slice(0, 120)}...`)
  }
}
