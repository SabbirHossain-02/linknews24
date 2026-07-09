export interface MockUser {
  name: string;
  email: string;
  avatar?: string; // data URL
  bio?: string;
  phone?: string;
  city?: string;
  joinedAt?: string; // ISO date
}

export interface BookmarkedArticle {
  slug: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  savedAt: string;
}

export interface HistoryEntry {
  slug: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  viewedAt: string;
}

const USER_KEY = "linknews24-user";
const BOOKMARKS_KEY = "linknews24-bookmarks";
const HISTORY_KEY = "linknews24-history";
const FOLLOWS_KEY = "linknews24-follows";
const HISTORY_LIMIT = 20;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredUser(): MockUser | null {
  return readJSON<MockUser | null>(USER_KEY, null);
}

export function storeUser(user: MockUser) {
  writeJSON(USER_KEY, user);
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// --- Followed topics (category slugs) ---

export function getFollowedTopics(): string[] {
  return readJSON<string[]>(FOLLOWS_KEY, []);
}

export function isFollowingTopic(slug: string): boolean {
  return getFollowedTopics().includes(slug);
}

export function toggleTopic(slug: string): boolean {
  const list = getFollowedTopics();
  const index = list.indexOf(slug);

  if (index >= 0) {
    list.splice(index, 1);
    writeJSON(FOLLOWS_KEY, list);
    return false;
  }

  list.push(slug);
  writeJSON(FOLLOWS_KEY, list);
  return true;
}

export function getBookmarks(): BookmarkedArticle[] {
  return readJSON<BookmarkedArticle[]>(BOOKMARKS_KEY, []);
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().some((b) => b.slug === slug);
}

export function toggleBookmark(article: Omit<BookmarkedArticle, "savedAt">): boolean {
  const bookmarks = getBookmarks();
  const existingIndex = bookmarks.findIndex((b) => b.slug === article.slug);

  if (existingIndex >= 0) {
    bookmarks.splice(existingIndex, 1);
    writeJSON(BOOKMARKS_KEY, bookmarks);
    return false;
  }

  bookmarks.unshift({ ...article, savedAt: new Date().toISOString() });
  writeJSON(BOOKMARKS_KEY, bookmarks);
  return true;
}

export function removeBookmark(slug: string) {
  writeJSON(
    BOOKMARKS_KEY,
    getBookmarks().filter((b) => b.slug !== slug),
  );
}

export function recordHistory(entry: Omit<HistoryEntry, "viewedAt">) {
  const history = getHistory().filter((h) => h.slug !== entry.slug);
  history.unshift({ ...entry, viewedAt: new Date().toISOString() });
  writeJSON(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));
}

export function getHistory(): HistoryEntry[] {
  return readJSON<HistoryEntry[]>(HISTORY_KEY, []);
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
