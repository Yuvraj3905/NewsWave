export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="bg-white rounded-lg border border-navy-100 shadow-card overflow-hidden dark:bg-navy-800 dark:border-navy-700">
          <div className="relative w-full aspect-[16/9] max-h-[480px] bg-surface-100 dark:bg-navy-700 animate-pulse" />
          <div className="p-4 sm:p-6 md:p-8 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-surface-100 rounded-full dark:bg-navy-700 animate-pulse" />
              <div className="h-5 w-16 bg-surface-100 rounded-full dark:bg-navy-700 animate-pulse" />
            </div>
            <div className="h-8 sm:h-10 w-3/4 bg-surface-100 rounded dark:bg-navy-700 animate-pulse" />
            <div className="h-8 sm:h-10 w-1/2 bg-surface-100 rounded dark:bg-navy-700 animate-pulse" />
            <div className="h-4 w-1/3 bg-surface-100 rounded dark:bg-navy-700 animate-pulse" />
            <div className="space-y-2 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-surface-100 rounded dark:bg-navy-700 animate-pulse"
                  style={{ width: `${85 - i * 5}%` }}
                />
              ))}
            </div>
          </div>
        </article>
        <aside className="hidden lg:block">
          <div className="bg-white border border-navy-100 rounded-lg shadow-card p-4 space-y-3 dark:bg-navy-800 dark:border-navy-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 bg-surface-100 rounded dark:bg-navy-700 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full bg-surface-100 rounded dark:bg-navy-700 animate-pulse" />
                  <div className="h-3 w-2/3 bg-surface-100 rounded dark:bg-navy-700 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
