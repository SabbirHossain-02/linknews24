import {
  Building2,
  Droplet,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Radio,
  Scale,
  Search,
  Settings,
  Tv,
} from "lucide-react";
import type { Module } from "@/components/admin/AdminAuthProvider";
import type { AdminKey } from "./admin-i18n";

/**
 * How each permission module is shown on the Roles page: the same name and
 * icon as its sidebar entry, and one line on what the switches there cover.
 * The descriptions are Bengali source strings, translated through ax().
 */
export const MODULE_META: Record<
  Module,
  { label: AdminKey; icon: typeof LayoutDashboard; about: string }
> = {
  dashboard: {
    label: "dashboard",
    icon: LayoutDashboard,
    about: "সাইটের ভিজিটর ও পরিসংখ্যান দেখা",
  },
  articles: {
    label: "articles",
    icon: Newspaper,
    about: "খবর লেখা, সম্পাদনা ও মোছা — প্রকাশের আগে অনুমোদন লাগবে",
  },
  categories: {
    label: "categoriesTags",
    icon: FolderTree,
    about: "ক্যাটাগরি ও ট্যাগ তৈরি, সাজানো ও মোছা",
  },
  breaking: { label: "breaking", icon: Radio, about: "ব্রেকিং নিউজের টিকার" },
  homepage: {
    label: "homepageBuilder",
    icon: LayoutTemplate,
    about: "হোমপেজের সেকশন ও খবরের ক্রম",
  },
  liveTv: { label: "liveTv", icon: Tv, about: "লাইভ টিভির লিংক ও চালু/বন্ধ" },
  media: { label: "media", icon: ImageIcon, about: "ছবি ও ফাইলের লাইব্রেরি" },
  epaper: { label: "epaper", icon: FileText, about: "ই-পেপারের সংস্করণ আপলোড" },
  lawyers: { label: "lawyers", icon: Scale, about: "আইনজীবীর আবেদন যাচাই ও তালিকা" },
  donors: { label: "donors", icon: Droplet, about: "রক্তদাতার আবেদন যাচাই ও তালিকা" },
  hospitals: {
    label: "hospitals",
    icon: Building2,
    about: "হাসপাতালের আবেদন যাচাই ও তালিকা",
  },
  newsletter: { label: "newsletter", icon: Mail, about: "নিউজলেটারের গ্রাহক তালিকা" },
  ads: { label: "ads", icon: Megaphone, about: "বিজ্ঞাপন অনুমোদন ও রিপোর্ট" },
  comments: {
    label: "comments",
    icon: MessageSquare,
    about: "পাঠকের মন্তব্য অনুমোদন ও মোছা",
  },
  seo: { label: "seo", icon: Search, about: "সার্চ ইঞ্জিন ও সোশ্যাল শেয়ারের সেটিং" },
  settings: {
    label: "settings",
    icon: Settings,
    about: "সাইটের লোগো, ফুটার ও সাধারণ সেটিং",
  },
};

export const MODULE_GROUP_LABEL: Record<string, string> = {
  content: "কনটেন্ট",
  directory: "সেবা ডিরেক্টরি",
  site: "সাইট পরিচালনা",
};
