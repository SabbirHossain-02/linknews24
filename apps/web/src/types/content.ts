export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: Category;
  author: string;
  publishedAt: string;
  imageTone: "navy" | "crimson" | "slate" | "amber";
  isBreaking?: boolean;
  isVideo?: boolean;
  videoDuration?: string;
  viewCount?: number;
}
