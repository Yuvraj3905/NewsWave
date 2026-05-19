import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-extrabold text-brand-900 dark:text-white">404</h1>
      <p className="mt-3 text-ink-500 dark:text-navy-300">
        That story may have been moved or no longer exists.
      </p>
      <Link
        href="/"
        className="inline-block mt-6 bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded font-semibold"
      >
        Back to Home
      </Link>
    </div>
  );
}
