import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { formatIST } from '@/lib/format';
import { LatestSidebar } from '@/components/LatestSidebar';
import { ArticleCard } from '@/components/ArticleCard';
import { ShareButtons } from '@/components/ShareButtons';
import { Language } from '@/lib/types';

interface PageProps {
  params: { slug: string };
}

const readLang = (): Language => {
  const c = cookies().get('newswave_lang')?.value;
  if (c === 'hi' || c === 'pa' || c === 'en') return c;
  return 'en';
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const article = await api.articleBySlug(params.slug, readLang());
    return {
      title: article.title,
      description:
        article.description || article.title + ' - NewsWave article',
      openGraph: {
        title: article.title,
        description: article.description || '',
        images: article.image_url ? [article.image_url] : undefined,
        type: 'article',
      },
    };
  } catch {
    return { title: 'Article not found' };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const lang = readLang();
  let article;
  try {
    article = await api.articleBySlug(params.slug, lang);
  } catch {
    notFound();
  }

  let related: Awaited<ReturnType<typeof api.relatedArticles>> = [];
  try {
    related = await api.relatedArticles(params.slug, lang);
  } catch {
    related = [];
  }

  const gallery = (article.images || []).slice().sort(
    (a, b) => a.position - b.position,
  );

  const paragraphs = (article.content || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="bg-white rounded-lg border border-navy-100 shadow-card overflow-hidden dark:bg-navy-800 dark:border-navy-700">
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full max-h-[480px] object-cover"
            />
          )}

          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.categories?.map((c) => (
                <span
                  key={c.id}
                  className="text-[11px] uppercase tracking-wider font-semibold bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full"
                >
                  {c.name}
                </span>
              ))}
              {article.locations?.map((l) => (
                <span
                  key={l.id}
                  className="text-[11px] uppercase tracking-wider font-semibold bg-navy-100 text-navy-700 px-2.5 py-1 rounded-full dark:bg-navy-700 dark:text-navy-100"
                >
                  {l.name}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-900 leading-tight dark:text-white">
              {article.title}
            </h1>

            <div className="mt-4 text-sm text-navy-500 flex flex-wrap gap-x-4 gap-y-1 dark:text-navy-300">
              <span>By {article.author || 'NewsWave Desk'}</span>
              <span>{formatIST(article.published_at || article.created_at)}</span>
              <span>{article.views} views</span>
            </div>

            {article.description && (
              <p className="mt-5 text-base sm:text-lg text-navy-700 leading-relaxed border-l-4 border-brand-500 pl-4 italic dark:text-navy-200">
                {article.description}
              </p>
            )}

            <div className="article-content mt-6">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <ShareButtons title={article.title} slug={article.slug} />

            {gallery.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-bold text-navy-900 mb-4 dark:text-white">
                  Photo Gallery
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {gallery.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative overflow-hidden rounded-lg border border-navy-100 hover:shadow-card transition"
                    >
                      <img
                        src={img.url}
                        alt={img.alt || article.title}
                        loading="lazy"
                        className="w-full h-44 object-cover"
                      />
                      {img.alt && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-xs px-2 py-1">
                          {img.alt}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <hr className="my-8 border-navy-100 dark:border-navy-700" />

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-4 dark:text-white">
                Similar News
              </h2>
              {related.length === 0 ? (
                <p className="text-sm text-navy-500 dark:text-navy-300">No related articles yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <ArticleCard key={r.id} article={r} />
                  ))}
                </div>
              )}
            </section>

            <div className="mt-8 text-sm">
              <Link href="/" className="text-brand-500 hover:underline font-semibold">
                &larr; Back to home
              </Link>
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <LatestSidebar />
        </aside>
      </div>
    </div>
  );
}
