"use client";

/**
 * The one switch the admin panel uses.
 *
 * Every list — articles, breaking news, categories, homepage rows, users, live
 * TV — had its own copy of a hand-rolled toggle, which meant six places to keep
 * in step and no shared focus or motion behaviour. This is that switch, once.
 *
 * The knob overshoots very slightly on its way across, which is what makes the
 * movement read as smooth rather than mechanical, and the whole thing stands
 * still for anyone who has asked for reduced motion.
 */
export function Toggle({
  checked,
  onChange,
  title,
  size = "sm",
  disabled,
  className = "",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Tooltip and accessible name — always say what the switch controls. */
  title: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const track =
    size === "md" ? "h-6 w-[44px] p-[3px]" : "h-[22px] w-[40px] p-[3px]";
  const knob = size === "md" ? "h-[18px] w-[18px]" : "h-4 w-4";
  const travel = size === "md" ? "translate-x-5" : "translate-x-[18px]";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title}
      title={title}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group relative inline-flex shrink-0 items-center rounded-full outline-none transition-[background-color,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-brand-crimson/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none ${track} ${
        checked
          ? "bg-brand-crimson shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)] hover:bg-brand-crimson-dark"
          : "bg-[#cdd2d9] shadow-[inset_0_1px_2px_rgba(20,24,31,0.12)] hover:bg-[#bcc2cb]"
      } ${className}`}
    >
      <span
        className={`pointer-events-none rounded-full bg-white shadow-[0_1px_2px_rgba(20,24,31,0.3)] transition-transform duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)] group-active:scale-90 motion-reduce:transition-none ${knob} ${
          checked ? travel : "translate-x-0"
        }`}
      />
    </button>
  );
}
