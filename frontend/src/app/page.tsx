import { MainFeed } from '@/components/MainFeed';
import { LatestSidebar } from '@/components/LatestSidebar';
import { TrendingNow } from '@/components/TrendingNow';
import { NewsletterCard } from '@/components/NewsletterCard';
import { ExploreMore } from '@/components/ExploreMore';
import { BreakingTicker } from '@/components/BreakingTicker';

export default function HomePage() {
  return (
    <>
      <BreakingTicker />
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-navy-900 dark:text-white">
                Today&apos;s News
              </h1>
              <p className="text-sm text-navy-500 mt-1 dark:text-navy-300">
                Latest headlines, filtered by your selected location and category.
              </p>
            </div>
            <MainFeed />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <LatestSidebar />
            <TrendingNow />
            <NewsletterCard />
          </aside>
        </div>

        <div className="mt-8 lg:mt-10">
          <ExploreMore />
        </div>
      </div>
    </>
  );
}
