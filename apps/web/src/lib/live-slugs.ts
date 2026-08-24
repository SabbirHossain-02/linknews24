import { API_BASE } from "./admin-api";

/**
 * Asks the API which of these article slugs are still published.
 *
 * Bookmarks and reading history are kept in the reader's own browser, so they
 * outlive the articles themselves — a story that was deleted or pulled back to
 * draft stayed in the list and gave a 404 when clicked. Everything built from
 * that stored data is filtered through here first.
 *
 * On a network failure it returns null rather than an empty set, so a hiccup
 * hides nothing: the caller keeps showing what it has.
 */
export async function liveSlugs(slugs: string[]): Promise<Set<string> | null> {
  const unique = [...new Set(slugs.filter(Boolean))].slice(0, 50);
  if (!unique.length) return new Set();

  try {
    const res = await fetch(
      `${API_BASE}/api/articles/exists?slugs=${unique.map(encodeURIComponent).join(",")}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { slugs?: string[] };
    return new Set(data.slugs ?? []);
  } catch {
    return null;
  }
}
