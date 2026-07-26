// Runnable self-check (no jest): npx ts-node src/media/watermark.check.ts
import { strict as assert } from 'assert';
import { buildWatermarkOverlay } from './media.service';

// Disabled when no logo configured
assert.equal(buildWatermarkOverlay({}), null, 'no logo => null (watermark off)');

// Enabled with defaults
const d = buildWatermarkOverlay({ WATERMARK_LOGO: 'newswave/logo' });
assert.ok(d, 'logo set => overlay object');
assert.equal(d!.overlay, 'newswave:logo', 'folder slash becomes colon');
assert.equal(d!.gravity, 'north_east');
assert.equal(d!.width, 0.15);
assert.equal(d!.opacity, 70);
assert.equal(d!.x, 10);

// Env overrides
const c = buildWatermarkOverlay({
  WATERMARK_LOGO: 'brand/mark',
  WATERMARK_GRAVITY: 'south_west',
  WATERMARK_WIDTH: '0.25',
  WATERMARK_OPACITY: '50',
  WATERMARK_MARGIN: '20',
});
assert.equal(c!.gravity, 'south_west');
assert.equal(c!.width, 0.25);
assert.equal(c!.opacity, 50);
assert.equal(c!.x, 20);
assert.equal(c!.y, 20);

console.log('watermark overlay: all checks passed');
