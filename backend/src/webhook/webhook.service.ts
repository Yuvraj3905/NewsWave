import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ArticleWebhookPayload {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  url: string;
  categories: string[];
  locations: string[];
  published_at: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  async dispatch(payload: ArticleWebhookPayload): Promise<void> {
    const url = process.env.SOCIAL_WEBHOOK_URL;
    if (!url) {
      this.logger.warn('SOCIAL_WEBHOOK_URL not set, skipping social dispatch.');
      return;
    }

    try {
      await axios.post(url, payload, {
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' },
      });
      this.logger.log(`Webhook dispatched for article ${payload.slug}`);
    } catch (err: any) {
      this.logger.error(
        `Webhook dispatch failed: ${err?.message || err}`,
      );
    }
  }
}
