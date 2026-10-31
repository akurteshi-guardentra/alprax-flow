// Helpers for preserving and consuming a same-origin `?next=` redirect target.
// Used so OAuth consent flows can bounce through /login and return to the
// original consent URL (e.g. /.lovable/oauth/consent?authorization_id=...).

function canonicalNext(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return null;
  const origin = "https://app.invalid";
  try {
    const target = new URL(value, origin);
    if (target.origin !== origin || target.pathname.startsWith("//")) return null;
    return target.pathname + target.search + target.hash;
  } catch {
    return null;
  }
}

export function isSafeNext(next: string | null | undefined): next is string {
  return canonicalNext(next) !== null;
}

export function getNextParam(search: string = window.location.search): string | null {
  const p = new URLSearchParams(search);
  const next = p.get("next");
  return canonicalNext(next);
}

export function withNext(base: string, next: string): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}next=${encodeURIComponent(next)}`;
}

export function consumeNextOr(fallback: string): string {
  return getNextParam() ?? fallback;
}
