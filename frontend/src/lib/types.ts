export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
}

export type Language = 'en' | 'hi' | 'pa';

export interface ArticleTranslation {
  id: string;
  article_id: string;
  language: Language;
  title: string;
  slug: string;
  description?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleImage {
  id: string;
  article_id: string;
  url: string;
  alt?: string;
  position: number;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  image_url?: string;
  author?: string;
  views: number;
  published: boolean;
  published_at?: string | null;
  categories: Category[];
  locations: Location[];
  translations?: ArticleTranslation[];
  images?: ArticleImage[];
  created_at: string;
  updated_at: string;
}

export interface ArticleListResponse {
  items: Article[];
  total: number;
}

export interface AuthResponse {
  access_token: string;
  manager: { id: string; username: string; role: string };
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  created_at: string;
}
