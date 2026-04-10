export function parseNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseInteger(value: unknown): number | null {
  const num = parseNumber(value);
  if (!Number.isFinite(num)) return null;
  const int = Math.trunc(num);
  return Number.isNaN(int) ? null : int;
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  return ["si", "sí", "yes", "true", "1", "x"].includes(text);
}

export function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const text = String(value ?? "").trim();
  if (!text) return null;
  const normalized = text.replace(/\./g, "/").replace(/-/g, "/");
  const parts = normalized.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts.map((part) => Number(part));
    const date = new Date(y, m - 1, d);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const native = new Date(text);
  return Number.isNaN(native.getTime()) ? null : native;
}

export function parsePercentage(value: unknown): number {
  const text = String(value ?? "").trim();
  if (!text) return 0;
  const number = parseNumber(text);
  return text.includes("%") ? number : number <= 1 ? number * 100 : number;
}

export function parseText(value: unknown): string {
  return String(value ?? "").trim();
}
