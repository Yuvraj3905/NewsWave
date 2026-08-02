import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export interface WatermarkOverlay {
  overlay: string;
  gravity: string;
  width: number;
  opacity: number;
  flags: string;
  x: number;
  y: number;
}

// Pure: builds the Cloudinary overlay transform from env, or null if disabled.
// Kept standalone so it can be unit-checked without a Cloudinary connection.
export function buildWatermarkOverlay(
  env: Record<string, string | undefined>,
): WatermarkOverlay | null {
  const logo = env.WATERMARK_LOGO;
  if (!logo) return null;
  const gravity = env.WATERMARK_GRAVITY || 'center';
  // Corner gravities (north_east etc.) get cropped inconsistently by frontend
  // object-cover boxes since crop amount varies with each image's own aspect
  // ratio. Center gravity survives any center-crop unchanged, so it stays put
  // on-page AND on direct download/save alike. Margin only makes sense off-center.
  const margin = Number(env.WATERMARK_MARGIN) || 10;
  return {
    // Cloudinary overlays reference folders with ':' not '/'.
    overlay: logo.replace(/\//g, ':'),
    gravity,
    width: Number(env.WATERMARK_WIDTH) || 0.3,
    opacity: Number(env.WATERMARK_OPACITY) || 40,
    flags: 'relative',
    x: gravity === 'center' ? 0 : margin,
    y: gravity === 'center' ? 0 : margin,
  };
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private configured = false;

  constructor() {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;

    if (cloud && key && secret) {
      cloudinary.config({
        cloud_name: cloud,
        api_key: key,
        api_secret: secret,
        secure: true,
      });
      this.configured = true;
    } else {
      this.logger.warn(
        'Cloudinary credentials missing. Image uploads will be skipped.',
      );
    }
  }

  async uploadBuffer(buffer: Buffer, filename: string): Promise<string | null> {
    if (!this.configured) return null;

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || 'newswave',
          public_id: filename.replace(/\.[^/.]+$/, ''),
          resource_type: 'image',
          overwrite: true,
        },
        (err, result) => {
          if (err || !result) return reject(err);
          // Original is stored untouched; the watermark is a delivery
          // transform, so it can be changed/removed later without re-upload.
          const overlay = buildWatermarkOverlay(process.env);
          if (!overlay) return resolve(result.secure_url);
          resolve(
            cloudinary.url(result.public_id, {
              transformation: [overlay],
              secure: true,
              version: result.version,
              resource_type: 'image',
            }),
          );
        },
      );
      upload.end(buffer);
    });
  }

  // Watermarks a remote image URL (hero-by-URL, gallery-by-URL) via Cloudinary's
  // fetch delivery. Returns the URL unchanged if watermarking is off/unconfigured.
  watermarkUrl(url: string): string {
    if (!this.configured || !url) return url;
    const overlay = buildWatermarkOverlay(process.env);
    if (!overlay) return url;
    try {
      return cloudinary.url(url, {
        type: 'fetch',
        transformation: [overlay],
        secure: true,
      });
    } catch (err) {
      this.logger.warn(`watermarkUrl failed: ${(err as Error).message}`);
      return url;
    }
  }
}
