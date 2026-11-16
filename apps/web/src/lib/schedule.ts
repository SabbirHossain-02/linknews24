/**
 * Go-live times for scheduled stories.
 *
 * The editor's <input type="datetime-local"> speaks the browser's local time
 * without a zone ("2026-11-20T09:30"); the API stores an instant. These two
 * convert between them, and `scheduleLabel` shows an instant in Dhaka time,
 * which is the newsroom's clock whatever machine is looking.
 */

/** ISO instant → the value a datetime-local input expects, in local time. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** A datetime-local value → ISO instant, or null when empty or unreadable. */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** "২০ নভে, ২০২৬, ৯:৩০ AM" / "20 Nov 2026, 09:30", in Dhaka time. */
export function scheduleLabel(iso: string, locale: "bn" | "en"): string {
  return new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  });
}
