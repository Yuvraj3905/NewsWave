import { Injectable, Logger } from '@nestjs/common';
import { XService } from './x.service';
import { FacebookService } from './facebook.service';
import { InstagramService } from './instagram.service';
import {
  SocialPostPayload,
  SocialPostResult,
  SocialTargets,
} from './social.types';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private readonly x: XService,
    private readonly fb: FacebookService,
    private readonly ig: InstagramService,
  ) {}

  async dispatch(
    payload: SocialPostPayload,
    targets: SocialTargets,
  ): Promise<SocialPostResult[]> {
    const tasks: Promise<SocialPostResult>[] = [];
    if (targets.x) tasks.push(this.x.post(payload));
    if (targets.facebook) tasks.push(this.fb.post(payload));
    if (targets.instagram) tasks.push(this.ig.post(payload));

    if (tasks.length === 0) return [];

    const results = await Promise.all(tasks);
    results.forEach((r) => {
      if (r.success) {
        this.logger.log(`${r.platform} ok: ${r.external_id}`);
      } else {
        this.logger.warn(`${r.platform} fail: ${r.error}`);
      }
    });
    return results;
  }
}
