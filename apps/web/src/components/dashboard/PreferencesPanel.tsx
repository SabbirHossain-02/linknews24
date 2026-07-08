"use client";

import { useEffect, useState } from "react";

const PREFS_KEY = "linknews24-preferences";

interface Preferences {
  newsletter: boolean;
  breakingAlerts: boolean;
}

const DEFAULT_PREFS: Preferences = { newsletter: false, breakingAlerts: true };

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-crimson" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export function PreferencesPanel() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  useEffect(() => {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) setPrefs(JSON.parse(raw));
  }, []);

  const update = (patch: Partial<Preferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <h2 className="text-lg font-bold text-heading">প্রেফারেন্স</h2>
      <div className="mt-3 flex flex-col divide-y divide-border">
        <Toggle
          checked={prefs.newsletter}
          onChange={(v) => update({ newsletter: v })}
          label="দৈনিক নিউজলেটার ইমেইল"
        />
        <Toggle
          checked={prefs.breakingAlerts}
          onChange={(v) => update({ breakingAlerts: v })}
          label="ব্রেকিং নিউজ নোটিফিকেশন"
        />
      </div>
    </div>
  );
}
