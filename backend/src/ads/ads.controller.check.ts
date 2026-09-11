/**
 * Guard check for AdsController. Ads carry a raw `html` field that the public
 * site renders with dangerouslySetInnerHTML, so write access must be admin+ —
 * JwtAuthGuard alone would let an `editor` store site-wide XSS.
 * Run: npx ts-node src/ads/ads.controller.check.ts
 */
import { strict as assert } from 'assert';
import { ROLES_KEY } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AdsController } from './ads.controller';

const PROTECTED = ['adminList', 'findOne', 'create', 'update', 'remove'];
const proto = AdsController.prototype as Record<string, any>;

for (const name of PROTECTED) {
  const handler = proto[name];
  assert.ok(handler, `${name} missing from AdsController`);
  const guards = Reflect.getMetadata('__guards__', handler) || [];
  assert.ok(guards.includes(JwtAuthGuard), `${name}: JwtAuthGuard missing`);
  assert.ok(guards.includes(RolesGuard), `${name}: RolesGuard missing`);
  const roles = Reflect.getMetadata(ROLES_KEY, handler);
  assert.deepEqual(
    roles,
    ['superadmin', 'admin'],
    `${name}: expected @Roles('superadmin','admin'), got ${JSON.stringify(roles)}`,
  );
}

// The slot feed stays public — the site fetches it unauthenticated.
const publicGuards = Reflect.getMetadata('__guards__', proto.active) || [];
assert.equal(publicGuards.length, 0, 'active() must stay public');

console.log(`ok — ${PROTECTED.length} ad routes gated to superadmin/admin, active() public`);
