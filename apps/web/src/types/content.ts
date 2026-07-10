export interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  category: Category;
  author: string;
  publishedAt: string;
  imageTone: "navy" | "crimson" | "slate" | "amber";
  featuredImage?: string | null;
  isBreaking?: boolean;
  isVideo?: boolean;
  isGallery?: boolean;
  videoDuration?: string;
  viewCount?: number;
}
