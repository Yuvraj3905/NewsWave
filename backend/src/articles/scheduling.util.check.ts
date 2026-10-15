// Runnable self-check (no jest in this project): npx ts-node src/articles/scheduling.util.check.ts
import { strict as assert } from 'assert';
import {
  MAX_TIMEOUT_MS,
  nextSweepDelay,
  resolvePublishState,
} from './scheduling.util';

const NOW = 1_000_000; // fixed clock
const future = new Date(NOW + 60_000).toISOString();
const past = new Date(NOW - 60_000).toISOString();

// Future schedule -> hidden, scheduled, published_at stamped to schedule time
let s = resolvePublishState({ scheduled_at: future }, NOW);
assert.equal(s.published, false, 'future schedule must be unpublished');
assert.equal(s.scheduled_at?.getTime(), NOW + 60_000);
assert.equal(s.published_at?.getTime(), NOW + 60_000);

// Past schedule -> publish now, no schedule left behind
s = resolvePublishState({ scheduled_at: past }, NOW);
assert.equal(s.published, true, 'past schedule must publish immediately');
assert.equal(s.scheduled_at, null);

// No schedule, published omitted -> defaults to published
s = resolvePublishState({}, NOW);
assert.equal(s.published, true);
assert.equal(s.scheduled_at, null);

// No schedule, explicit draft -> stays draft, no schedule
s = resolvePublishState({ published: false }, NOW);
assert.equal(s.published, false);
assert.equal(s.scheduled_at, null);

// Empty/cleared schedule behaves like no schedule
s = resolvePublishState({ scheduled_at: null, published: true }, NOW);
assert.equal(s.published, true);
assert.equal(s.scheduled_at, null);

// nextSweepDelay: future -> exact gap, overdue -> 0, far future -> clamped
assert.equal(nextSweepDelay(new Date(NOW + 60_000), NOW), 60_000);
assert.equal(nextSweepDelay(new Date(NOW - 60_000), NOW), 0);
assert.equal(nextSweepDelay(new Date(NOW + 90 * 86_400_000), NOW), MAX_TIMEOUT_MS);

console.log('scheduling.util: all checks passed');
