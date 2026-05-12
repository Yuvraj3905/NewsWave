import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SocialPostPayload, SocialPostResult } from './social.types';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  async post(payload: SocialPostPayload): Promise<SocialPostResult> {
    const igUser = process.env.IG_USER_ID;
    const token = process.env.FB_PAGE_TOKEN;
    if (!igUser || !token) {
      return {
        platform: 'instagram',
        success: false,
        error: 'IG_USER_ID or FB_PAGE_TOKEN not set',
      };
    }
    if (!payload.image_url) {
      return {
        platform: 'instagram',
        success: false,
        error: 'Instagram requires image_url',
      };
    }

    const tags = (payload.categories || [])
      .concat(payload.locations || [])
      .slice(0, 5)
      .map((t) => `#${t.replace(/\s+/g, '')}`)
      .join(' ');
    const caption = [payload.title, payload.description, tags, 'Link in bio.']
      .filter(Boolean)
      .join('\n\n');

    try {
      // Step 1: create media container
      const containerRes = await axios.post(
        `https://graph.facebook.com/v19.0/${igUser}/media`,
        null,
        {
          params: {
            image_url: payload.image_url,
            caption,
            access_token: token,
          },
          timeout: 20000,
        },
      );
      const creationId = containerRes.data?.id;
      if (!creationId) {
        return {
          platform: 'instagram',
          success: false,
          error: 'No creation_id returned',
        };
      }

      // Step 2: publish
      const pubRes = await axios.post(
        `https://graph.facebook.com/v19.0/${igUser}/media_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: token,
          },
          timeout: 20000,
        },
      );
      this.logger.log(`IG post ok: ${pubRes.data?.id}`);
      return {
        platform: 'instagram',
        success: true,
        external_id: pubRes.data?.id,
      };
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err?.message || 'unknown';
      this.logger.error(`IG post failed: ${msg}`);
      return {
        platform: 'instagram',
        success: false,
        error: String(msg).slice(0, 240),
      };
    }
  }
}
