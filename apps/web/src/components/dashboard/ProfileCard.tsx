import type { MockUser } from "@/lib/auth-storage";

export function ProfileCard({
  user,
  onLogout,
}: {
  user: MockUser;
  onLogout: () => void;
}) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-crimson font-ui text-xl font-bold text-white">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{user.name}</p>
        <p className="truncate font-ui text-sm text-foreground-muted">{user.email}</p>
      </div>
      <button
        onClick={onLogout}
        className="shrink-0 rounded-lg border border-border px-4 py-2 font-ui text-sm font-medium text-brand-crimson transition-colors hover:bg-surface"
      >
        লগআউট
      </button>
    </div>
  );
}
