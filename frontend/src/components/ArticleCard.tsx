import Link from 'next/link';
import { Article } from '@/lib/types';
import { formatIST } from '@/lib/format';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&auto=format&fit=crop&q=60';

export function ArticleCard({
  article,
  variant = 'default',
}: {
  article: Article;
  variant?: 'default' | 'feature';
}) {
  const isFeature = variant === 'feature';

  return (
    <article
      className={`group bg-white rounded-lg border border-navy-100 shadow-card hover:shadow-cardHover transition overflow-hidden flex flex-col dark:bg-navy-800 dark:border-navy-700 ${
        isFeature ? 'sm:col-span-2' : ''
      }`}
    >
      <Link href={`/article/${article.slug}`} className="block">
        <div
          className={`relative w-full bg-surface-100 overflow-hidden ${
            isFeature ? 'aspect-[16/9]' : 'aspect-[4/3]'
          }`}
        >
          <img
            src={article.image_url || FALLBACK_IMG}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500"
          />
          {article.categories?.[0] && (
            <span className="absolute top-3 left-3 bg-brand-500 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
              {article.categories[0].name}
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {article.locations?.[0] && (
          <span className="text-[11px] uppercase tracking-wider font-semibold text-brand-500 mb-1.5">
            {article.locations[0].name}
          </span>
        )}

        <Link href={`/article/${article.slug}`}>
          <h2
            className={`font-bold text-navy-900 leading-snug group-hover:text-brand-500 transition dark:text-navy-50 ${
              isFeature ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
            }`}
          >
            {article.title}
          </h2>
        </Link>

        {article.description && (
          <p className="text-navy-700 text-sm mt-2 line-clamp-3 dark:text-navy-200">
            {article.description}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-navy-500 dark:text-navy-300">
          <time>{formatIST(article.created_at)}</time>
          <Link
            href={`/article/${article.slug}`}
            className="text-brand-500 font-bold hover:underline"
          >
            Read More &rsaquo;
          </Link>
        </div>
      </div>
    </article>
  );
}
