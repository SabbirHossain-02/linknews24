/**
 * Slows down anyone guessing passwords.
 *
 * Without this the sign-in endpoint would answer as fast as a script could ask,
 * so a common-password list could be worked through in minutes. Failures are
 * counted per address and per account: per address stops one machine hammering
 * away, per account stops a spread-out attempt on one editor from many.
 *
 * Held in memory rather than the database on purpose — it must be cheap enough
 * to run on every attempt, and losing the counters on a restart is acceptable
 * (a restart is not something an attacker can trigger).
 */

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
/** Failures older than this no longer count towards a lock. */
const WINDOW_MS = 15 * 60 * 1000;

interface Record {
  failures: number[];
  lockedUntil: number;
}

const byKey = new Map<string, Record>();

/** Drops entries nobody has touched for a while, so the map cannot grow forever. */
function sweep(now: number) {
  for (const [key, rec] of byKey) {
    const last = rec.failures[rec.failures.length - 1] ?? 0;
    if (rec.lockedUntil < now && last < now - WINDOW_MS) byKey.delete(key);
  }
}

function read(key: string, now: number): Record {
  const rec = byKey.get(key) ?? { failures: [], lockedUntil: 0 };
  rec.failures = rec.failures.filter((t) => t > now - WINDOW_MS);
  return rec;
}

export interface LockState {
  locked: boolean;
  /** Whole seconds until the next attempt is allowed. */
  retryAfter: number;
  /** Attempts left before a lock, for the message shown to a real person. */
  remaining: number;
}

/** Whether this address and account may try right now. */
export function checkLogin(ip: string | null, email: string): LockState {
  const now = Date.now();
  if (byKey.size > 500) sweep(now);

  let locked = false;
  let until = 0;
  let remaining = MAX_FAILURES;

  for (const key of keysFor(ip, email)) {
    const rec = read(key, now);
    if (rec.lockedUntil > now) {
      locked = true;
      until = Math.max(until, rec.lockedUntil);
    }
    remaining = Math.min(remaining, MAX_FAILURES - rec.failures.length);
  }

  return {
    locked,
    retryAfter: locked ? Math.ceil((until - now) / 1000) : 0,
    remaining: Math.max(0, remaining),
  };
}

/** Counts a wrong password, and locks once the limit is reached. */
export function recordFailure(ip: string | null, email: string): LockState {
  const now = Date.now();
  for (const key of keysFor(ip, email)) {
    const rec = read(key, now);
    rec.failures.push(now);
    if (rec.failures.length >= MAX_FAILURES) {
      rec.lockedUntil = now + LOCK_MS;
      rec.failures = [];
    }
    byKey.set(key, rec);
  }
  return checkLogin(ip, email);
}

/** A correct password clears the slate for that address and account. */
export function recordSuccess(ip: string | null, email: string) {
  for (const key of keysFor(ip, email)) byKey.delete(key);
}

function keysFor(ip: string | null, email: string): string[] {
  const keys = [`email:${email.toLowerCase()}`];
  if (ip) keys.push(`ip:${ip}`);
  return keys;
}
