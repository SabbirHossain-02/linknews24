import {
  siDiscord,
  siFacebook,
  siInstagram,
  siMessenger,
  siPinterest,
  siReddit,
  siSnapchat,
  siTelegram,
  siThreads,
  siTiktok,
  siViber,
  siWhatsapp,
  siX,
  siYoutube,
} from "simple-icons";

/**
 * The social networks the footer can link to, each with its real logo and
 * brand colour (from Simple Icons). Settings stores only the key and the URL;
 * everything visual comes from here, so the admin picks "Facebook" and the
 * footer shows Facebook's own blue "f".
 */
export interface SocialPlatform {
  key: string;
  name: string;
  /** Brand colour, without the #. */
  hex: string;
  /** 24×24 SVG path of the logo. */
  path: string;
  /** Dark logo on the badge, for brands whose colour is too light for white. */
  darkIcon?: boolean;
  /** CSS background when the brand is a gradient rather than one colour. */
  background?: string;
}

// LinkedIn is not in Simple Icons; its mark is drawn here.
const LINKEDIN_PATH =
  "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z";

// A plain globe, for a link that is not a social network.
const WEB_PATH =
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 6h-2.95a15.6 15.6 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8ZM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96ZM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26Zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A8 8 0 0 1 5.07 16Zm2.95-8H5.07a8 8 0 0 1 4.33-3.56A15.6 15.6 0 0 0 8.02 8ZM12 19.96A14.1 14.1 0 0 1 10.09 16h3.82A14.1 14.1 0 0 1 12 19.96ZM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4Zm.26 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56ZM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8.2 8.2 0 0 1 0 4h-3.38Z";

const from = (
  key: string,
  icon: { title: string; hex: string; path: string },
  extra: Partial<SocialPlatform> = {},
): SocialPlatform => ({ key, name: icon.title, hex: icon.hex, path: icon.path, ...extra });

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  from("facebook", siFacebook),
  from("youtube", siYoutube),
  from("instagram", siInstagram, {
    background:
      "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
  }),
  from("x", siX, { name: "X (Twitter)" }),
  from("tiktok", siTiktok),
  { key: "linkedin", name: "LinkedIn", hex: "0A66C2", path: LINKEDIN_PATH },
  from("whatsapp", siWhatsapp),
  from("telegram", siTelegram),
  from("messenger", siMessenger),
  from("threads", siThreads),
  from("pinterest", siPinterest),
  from("snapchat", siSnapchat, { darkIcon: true }),
  from("reddit", siReddit),
  from("discord", siDiscord),
  from("viber", siViber),
  { key: "website", name: "Website", hex: "475569", path: WEB_PATH },
];

export function platformFor(key: string): SocialPlatform | undefined {
  return SOCIAL_PLATFORMS.find((p) => p.key === key);
}

export interface SocialLink {
  platform: string;
  url: string;
}

/**
 * The footer's links: the list set in Settings, or — for a site saved before
 * that list existed — the three fixed Facebook / X / YouTube fields.
 */
export function socialLinks(cfg: {
  socials?: SocialLink[];
  facebook?: string;
  twitter?: string;
  youtube?: string;
}): SocialLink[] {
  if (Array.isArray(cfg.socials))
    return cfg.socials.filter((s) => s?.url?.trim() && platformFor(s.platform));
  return [
    { platform: "facebook", url: cfg.facebook ?? "" },
    { platform: "x", url: cfg.twitter ?? "" },
    { platform: "youtube", url: cfg.youtube ?? "" },
  ].filter((s) => s.url.trim());
}

/** The logo on a round badge in the brand's own colour. */
export function SocialBadge({
  platform,
  size = 36,
  className = "",
}: {
  platform: SocialPlatform;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: platform.background ?? `#${platform.hex}`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        style={{ width: size * 0.5, height: size * 0.5 }}
        fill={platform.darkIcon ? "#000" : "#fff"}
      >
        <path d={platform.path} />
      </svg>
    </span>
  );
}
