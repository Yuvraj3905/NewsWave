export interface SocialPostPayload {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  url: string;
  categories: string[];
  locations: string[];
  published_at: string;
}

export interface SocialPostResult {
  platform: 'x' | 'facebook' | 'instagram';
  success: boolean;
  external_id?: string;
  error?: string;
}

export type SocialTargets = {
  x?: boolean;
  facebook?: boolean;
  instagram?: boolean;
};
