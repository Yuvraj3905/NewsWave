import {
  Article,
  ArticleImage,
  ArticleListResponse,
  Ad,
  AdSlot,
  ArticleTranslation,
  AuthResponse,
  Category,
  Language,
  Location,
  Subscriber,
  SubscriberCounts,
  SubscriberStatus,
} from './types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { token, query, headers, ...rest } = opts;
  let url = `${API_URL}${path}`;
  if (query) {
    const search = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        search.append(k, String(v));
      }
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (
    rest.body &&
    !(rest.body instanceof FormData) &&
    !finalHeaders['Content-Type']
  ) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    cache: rest.cache ?? 'no-store',
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // Public
  listArticles: (query?: Record<string, any>) =>
    request<ArticleListResponse>('/articles', { query }),
  latestHeadlines: (lang?: Language) =>
    request<Article[]>('/articles/latest', { query: { lang } }),
  articleBySlug: (slug: string, lang?: Language) =>
    request<Article>(`/articles/slug/${slug}`, { query: { lang } }),
  relatedArticles: (slug: string, lang?: Language) =>
    request<Article[]>(`/articles/slug/${slug}/related`, { query: { lang } }),
  listCategories: () => request<Category[]>('/categories'),
  listLocations: () => request<Location[]>('/locations'),
  listAds: (slot: AdSlot) => request<Ad[]>('/ads', { query: { slot } }),
  listArticleImages: (id: string) =>
    request<ArticleImage[]>(`/articles/${id}/images`),
  subscribe: (email: string, name?: string) =>
    request<Subscriber>('/subscribers', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    }),

  // Auth
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: (token: string) => request<any>('/auth/me', { token }),

  // Admin
  adminListArticles: (token: string, query?: Record<string, any>) =>
    request<ArticleListResponse>('/articles', {
      token,
      query: { ...query, includeUnpublished: true },
    }),
  adminCreateArticle: (token: string, formData: FormData) =>
    request<Article>('/articles', {
      method: 'POST',
      body: formData,
      token,
    }),
  adminUpdateArticle: (token: string, id: string, formData: FormData) =>
    request<Article>(`/articles/${id}`, {
      method: 'PATCH',
      body: formData,
      token,
    }),
  adminDeleteArticle: (token: string, id: string) =>
    request<void>(`/articles/${id}`, { method: 'DELETE', token }),
  adminReorderArticles: (
    token: string,
    items: { id: string; display_order: number | null }[],
  ) =>
    request<{ updated: number }>('/articles/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
      token,
    }),
  adminStats: (token: string) =>
    request<{
      total_articles: number;
      published_articles: number;
      total_views: number;
    }>('/articles/stats', { token }),
  adminAnalytics: (token: string) =>
    request<{
      per_day: { day: string; count: number }[];
      by_category: { name: string; count: number }[];
      by_location: { name: string; count: number }[];
      top_articles: { id: string; title: string; slug: string; views: number }[];
      by_language: { language: string; count: number }[];
    }>('/articles/analytics', { token }),
  adminListSubscribers: (token: string, status?: SubscriberStatus) =>
    request<Subscriber[]>('/subscribers', {
      token,
      query: status ? { status } : undefined,
    }),
  adminSubscriberCount: (token: string) =>
    request<SubscriberCounts>('/subscribers/count', { token }),
  adminApproveSubscriber: (token: string, id: string) =>
    request<Subscriber>(`/subscribers/${id}/approve`, {
      method: 'PATCH',
      token,
    }),
  adminRejectSubscriber: (token: string, id: string) =>
    request<Subscriber>(`/subscribers/${id}/reject`, {
      method: 'PATCH',
      token,
    }),
  adminRevokeSubscriber: (token: string, id: string) =>
    request<Subscriber>(`/subscribers/${id}/revoke`, {
      method: 'PATCH',
      token,
    }),
  adminDeleteSubscriber: (token: string, id: string) =>
    request<void>(`/subscribers/${id}`, { method: 'DELETE', token }),

  // Translations (admin)
  adminListTranslations: (token: string, articleId: string) =>
    request<ArticleTranslation[]>(`/articles/${articleId}/translations`, {
      token,
    }),
  adminUpsertTranslation: (
    token: string,
    articleId: string,
    payload: {
      language: Language;
      title: string;
      description?: string;
      content: string;
    },
  ) =>
    request<ArticleTranslation>(`/articles/${articleId}/translations`, {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),
  adminDeleteTranslation: (token: string, articleId: string, lang: Language) =>
    request<void>(`/articles/${articleId}/translations/${lang}`, {
      method: 'DELETE',
      token,
    }),

  // Images (admin)
  adminListImages: (token: string, articleId: string) =>
    request<ArticleImage[]>(`/articles/${articleId}/images`, { token }),
  adminAddImages: (token: string, articleId: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    return request<ArticleImage[]>(`/articles/${articleId}/images`, {
      method: 'POST',
      body: fd,
      token,
    });
  },
  adminAddImageByUrl: (
    token: string,
    articleId: string,
    url: string,
    alt?: string,
  ) =>
    request<ArticleImage>(`/articles/${articleId}/images/url`, {
      method: 'POST',
      body: JSON.stringify({ url, alt }),
      token,
    }),
  adminDeleteImage: (token: string, articleId: string, imageId: string) =>
    request<void>(`/articles/${articleId}/images/${imageId}`, {
      method: 'DELETE',
      token,
    }),

  // Ads (manager)
  adminListAds: (token: string) => request<Ad[]>('/ads/admin', { token }),
  adminCreateAd: (token: string, payload: Partial<Ad>) =>
    request<Ad>('/ads', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),
  adminUpdateAd: (token: string, id: string, payload: Partial<Ad>) =>
    request<Ad>(`/ads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      token,
    }),
  adminDeleteAd: (token: string, id: string) =>
    request<void>(`/ads/${id}`, { method: 'DELETE', token }),
};
