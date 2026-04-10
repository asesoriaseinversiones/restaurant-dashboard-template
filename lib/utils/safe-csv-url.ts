/**
 * Valida URLs antes de hacer fetch a CSV (Vercel / Sheets).
 * Rechaza vacíos, no-http(s), mal formadas y hosts de ejemplo / placeholder.
 */
const BLOCKED_HOSTS = new Set(
  ["example.com", "example.org", "example.net", "invalid", "test"].map((h) => h.toLowerCase())
);

const BLOCKED_HOST_SUFFIXES = [".example.com", ".example.org", ".example.net"];

const PLACEHOLDER_SNIPPETS = ["your_", "changeme", "placeholder", "todo_", "replace_me", "xxx"];

export function isSafeCsvFetchUrl(raw: string | undefined | null): boolean {
  if (raw == null) return false;
  const s = String(raw).trim();
  if (!s) return false;

  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return false;
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") return false;

  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return false;
  for (const suf of BLOCKED_HOST_SUFFIXES) {
    if (host.endsWith(suf)) return false;
  }

  const hay = `${u.pathname}${u.search}`.toLowerCase();
  for (const p of PLACEHOLDER_SNIPPETS) {
    if (hay.includes(p)) return false;
  }

  return true;
}
