import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { SocialPostPayload, SocialPostResult } from './social.types';

@Injectable()
export class XService {
  private readonly logger = new Logger(XService.name);

  private buildText(p: SocialPostPayload): string {
    const tags = (p.categories || [])
      .slice(0, 2)
      .map((c) => `#${c.replace(/\s+/g, '')}`)
      .join(' ');
    const base = `${p.title}\n\n${p.url}`;
    const withTags = tags ? `${base}\n\n${tags}` : base;
    return withTags.length > 280 ? `${p.title}\n\n${p.url}` : withTags;
  }

  private percentEncode(s: string): string {
    return encodeURIComponent(s)
      .replace(/!/g, '%21')
      .replace(/\*/g, '%2A')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');
  }

  private oauth1Header(method: string, url: string, body: object): string {
    const consumerKey = process.env.X_API_KEY!;
    const consumerSecret = process.env.X_API_SECRET!;
    const token = process.env.X_ACCESS_TOKEN!;
    const tokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

    const oauth: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: token,
      oauth_version: '1.0',
    };

    const paramString = Object.keys(oauth)
      .sort()
      .map((k) => `${this.percentEncode(k)}=${this.percentEncode(oauth[k])}`)
      .join('&');

    const baseString = [
      method.toUpperCase(),
      this.percentEncode(url),
      this.percentEncode(paramString),
    ].join('&');

    const signingKey = `${this.percentEncode(consumerSecret)}&${this.percentEncode(tokenSecret)}`;
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    oauth.oauth_signature = signature;

    return (
      'OAuth ' +
      Object.keys(oauth)
        .sort()
        .map((k) => `${this.percentEncode(k)}="${this.percentEncode(oauth[k])}"`)
        .join(', ')
    );
  }

  async post(payload: SocialPostPayload): Promise<SocialPostResult> {
    if (
      !process.env.X_API_KEY ||
      !process.env.X_API_SECRET ||
      !process.env.X_ACCESS_TOKEN ||
      !process.env.X_ACCESS_TOKEN_SECRET
    ) {
      return { platform: 'x', success: false, error: 'X credentials not configured' };
    }

    const url = 'https://api.twitter.com/2/tweets';
    const body = { text: this.buildText(payload) };

    try {
      const auth = this.oauth1Header('POST', url, body);
      const res = await axios.post(url, body, {
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      this.logger.log(`X post ok: ${res.data?.data?.id}`);
      return {
        platform: 'x',
        success: true,
        external_id: res.data?.data?.id,
      };
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        'unknown';
      this.logger.error(`X post failed: ${msg}`);
      return { platform: 'x', success: false, error: String(msg).slice(0, 240) };
    }
  }
}
