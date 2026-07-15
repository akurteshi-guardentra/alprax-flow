// Helpers for preserving and consuming a same-origin `?next=` redirect target.
// Used so OAuth consent flows can bounce through /login and return to the
// original consent URL (e.g. /.lovable/oauth/consent?authorization_id=...).

export function isSafeNext(next: string | null | undefined): next is string {
  if (!next) return false;
  // Must be a relative same-origin path.
  if (!next.startsWith("/") || next.startsWith("//")) return false;
  return true;
}

export function getNextParam(search: string = window.location.search): string | null {
  const p = new URLSearchParams(search);
  const next = p.get("next");
  return isSafeNext(next) ? next : null;
}

export function withNext(base: string, next: string): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}next=${encodeURIComponent(next)}`;
}

export function consumeNextOr(fallback: string): string {
  return getNextParam() ?? fallback;
}
