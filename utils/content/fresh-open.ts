import { FRESH_OPEN_QUERY_PARAM } from '@/shared/cards';

/**
 * True when the tab was opened from a NeetcodeSRS problem link.
 * Those links request a clean editor (no prior draft / last submission).
 */
export function hasFreshOpenFlag(search: string = window.location.search): boolean {
  const params = new URLSearchParams(search);
  return params.get(FRESH_OPEN_QUERY_PARAM) === '1';
}

/** Remove the fresh-open flag from the URL without reloading. */
export function stripFreshOpenFlag(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(FRESH_OPEN_QUERY_PARAM)) {
    return;
  }
  url.searchParams.delete(FRESH_OPEN_QUERY_PARAM);
  window.history.replaceState(window.history.state, '', url.toString());
}

export function getProblemSlugFromPath(pathname: string = window.location.pathname): string | null {
  const match = pathname.match(/\/problems\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Best-effort wipe of browser-stored editor drafts for this problem.
 * Sites may also hydrate from account submissions — UI reset handles that.
 */
export function clearStoredEditorDrafts(slug: string): string[] {
  const removed: string[] = [];
  const normalizedSlug = slug.toLowerCase();

  for (const storage of [window.localStorage, window.sessionStorage]) {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) keys.push(key);
    }

    for (const key of keys) {
      if (shouldClearStorageKey(key, normalizedSlug)) {
        storage.removeItem(key);
        removed.push(key);
      }
    }
  }

  return removed;
}

export function shouldClearStorageKey(key: string, normalizedSlug: string): boolean {
  const lower = key.toLowerCase();

  // Never touch auth / session / sync keys
  if (/token|auth|session|cookie|csrf|login|oauth|gist|pat|firebase|supabase/i.test(lower)) {
    return false;
  }

  // Prefer keys scoped to this problem slug (NeetCode / some LeetCode caches)
  if (lower.includes(normalizedSlug)) {
    return true;
  }

  return false;
}
