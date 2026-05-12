'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken } from './AdminAuth';

interface Analytics {
  per_day: { day: string; count: number }[];
  by_category: { name: string; count: number }[];
  by_location: { name: string; count: number }[];
  top_articles: { id: string; title: string; slug: string; views: number }[];
  by_language: { language: string; count: number }[];
}

const LANG_LABEL: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  pa: 'Punjabi',
};

const PALETTE = ['#dc2640', '#091a3a', '#2c4880', '#a30f2c', '#4d68a1', '#7a0a20'];

export function AnalyticsCharts() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (!t) return;
    api
      .adminAnalytics(t)
      .then(setData)
      .catch((e) => setError(e?.message || 'Failed to load analytics'));
  }, []);

  if (error) {
    return (
      <div className="bg-white border border-brand-500/40 rounded p-4 text-sm text-brand-600">
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-navy-100 shadow-card p-6 text-sm text-navy-500">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Articles Published (last 30 days)">
          <LineChart data={fillDays(data.per_day, 30)} />
        </ChartCard>
        <ChartCard title="Articles by Category">
          <BarChart
            data={data.by_category.map((d, i) => ({
              label: d.name,
              value: d.count,
              color: PALETTE[i % PALETTE.length],
            }))}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Articles by Location">
          <BarChart
            data={data.by_location.map((d, i) => ({
              label: d.name,
              value: d.count,
              color: PALETTE[i % PALETTE.length],
            }))}
          />
        </ChartCard>
        <ChartCard title="Articles by Language">
          <DonutChart
            data={data.by_language.map((d, i) => ({
              label: LANG_LABEL[d.language] || d.language,
              value: d.count,
              color: PALETTE[i % PALETTE.length],
            }))}
          />
        </ChartCard>
      </div>

      <ChartCard title="Top 5 Articles by Views">
        <ol className="divide-y divide-navy-100">
          {data.top_articles.map((a, i) => (
            <li key={a.id} className="py-2 flex items-center gap-3 text-sm">
              <span className="w-6 h-6 grid place-items-center rounded-full bg-brand-500 text-white text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <Link
                href={`/article/${a.slug}`}
                target="_blank"
                className="flex-1 text-navy-900 hover:text-brand-600 truncate font-medium"
              >
                {a.title}
              </Link>
              <span className="text-navy-500 font-bold shrink-0">{a.views} views</span>
            </li>
          ))}
          {data.top_articles.length === 0 && (
            <li className="py-2 text-navy-500">No articles yet.</li>
          )}
        </ol>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-navy-100 shadow-card p-5">
      <h3 className="font-bold text-navy-900 mb-4 text-sm uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

function LineChart({ data }: { data: { day: string; count: number }[] }) {
  if (data.length === 0) return <Empty />;
  const W = 600;
  const H = 220;
  const PAD = 28;
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = (W - PAD * 2) / Math.max(1, data.length - 1);
  const points = data
    .map((d, i) => {
      const x = PAD + i * stepX;
      const y = H - PAD - (d.count / max) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(' ');
  const area = `M ${PAD},${H - PAD} L ${points.split(' ').join(' L ')} L ${
    PAD + (data.length - 1) * stepX
  },${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={PAD}
          x2={W - PAD}
          y1={PAD + t * (H - PAD * 2)}
          y2={PAD + t * (H - PAD * 2)}
          stroke="#eef2f8"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="#dc2640" fillOpacity="0.08" />
      <polyline points={points} fill="none" stroke="#dc2640" strokeWidth="2.5" />
      {data.map((d, i) => {
        const x = PAD + i * stepX;
        const y = H - PAD - (d.count / max) * (H - PAD * 2);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="#dc2640" />
            <title>{`${d.day}: ${d.count}`}</title>
          </g>
        );
      })}
      <text x={PAD} y={H - 6} fontSize="10" fill="#4d68a1">
        {data[0]?.day.slice(5)}
      </text>
      <text x={W - PAD} y={H - 6} fontSize="10" fill="#4d68a1" textAnchor="end">
        {data[data.length - 1]?.day.slice(5)}
      </text>
      <text x={PAD - 4} y={PAD + 4} fontSize="10" fill="#4d68a1" textAnchor="end">
        {max}
      </text>
      <text x={PAD - 4} y={H - PAD} fontSize="10" fill="#4d68a1" textAnchor="end">
        0
      </text>
    </svg>
  );
}

function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  if (data.length === 0) return <Empty />;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-xs text-navy-700 mb-1">
            <span className="font-medium truncate">{d.label}</span>
            <span className="text-navy-500 font-bold ml-2">{d.value}</span>
          </div>
          <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: d.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <Empty />;
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#eef2f8" strokeWidth="20" />
        {data.map((d) => {
          const len = (d.value / total) * C;
          const seg = (
            <circle
              key={d.label}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-navy-700 font-medium">{d.label}</span>
            <span className="text-navy-500 ml-1">
              ({Math.round((d.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-navy-500 py-8 text-center">No data yet</div>;
}

function fillDays(
  raw: { day: string; count: number }[],
  days: number,
): { day: string; count: number }[] {
  const map = new Map(raw.map((r) => [r.day, r.count]));
  const out: { day: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, count: map.get(key) || 0 });
  }
  return out;
}
