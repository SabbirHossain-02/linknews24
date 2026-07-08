import { FacebookIcon, XIcon } from "@/components/icons/SocialIcons";
import { MessageCircle } from "lucide-react";

export function ShareButtons({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-ui text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        শেয়ার করুন
      </span>
      <div className="flex items-center gap-2">
        <a
          href="#"
          aria-label="ফেসবুকে শেয়ার করুন"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-heading/5 text-heading transition-colors hover:bg-brand-navy hover:text-white"
        >
          <FacebookIcon className="h-4 w-4" />
        </a>
        <a
          href="#"
          aria-label="হোয়াটসঅ্যাপে শেয়ার করুন"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-heading/5 text-heading transition-colors hover:bg-brand-navy hover:text-white"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <a
          href="#"
          aria-label={`${title} শেয়ার করুন X-এ`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-heading/5 text-heading transition-colors hover:bg-brand-navy hover:text-white"
        >
          <XIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
