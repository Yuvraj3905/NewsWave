import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SocialPostPayload, SocialPostResult } from './social.types';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);

  async post(payload: SocialPostPayload): Promise<SocialPostResult> {
    const pageId = process.env.FB_PAGE_ID;
    const token = process.env.FB_PAGE_TOKEN;
    if (!pageId || !token) {
      return {
        platform: 'facebook',
        success: false,
        error: 'FB_PAGE_ID or FB_PAGE_TOKEN not set',
      };
    }

    const message = [payload.title, payload.description, `Read more: ${payload.url}`]
      .filter(Boolean)
      .join('\n\n');

    try {
      // If image present, post photo with caption + link in message.
      // Otherwise post link only.
      let res;
      if (payload.image_url) {
        res = await axios.post(
          `https://graph.facebook.com/v19.0/${pageId}/photos`,
          null,
          {
            params: {
              url: payload.image_url,
              caption: message,
              access_token: token,
            },
            timeout: 15000,
          },
        );
      } else {
        res = await axios.post(
          `https://graph.facebook.com/v19.0/${pageId}/feed`,
          null,
          {
            params: {
              message,
              link: payload.url,
              access_token: token,
            },
            timeout: 15000,
          },
        );
      }
      this.logger.log(`FB post ok: ${res.data?.id || res.data?.post_id}`);
      return {
        platform: 'facebook',
        success: true,
        external_id: res.data?.id || res.data?.post_id,
      };
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err?.message || 'unknown';
      this.logger.error(`FB post failed: ${msg}`);
      return {
        platform: 'facebook',
        success: false,
        error: String(msg).slice(0, 240),
      };
    }
  }
}
