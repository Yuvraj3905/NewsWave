import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

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
          resolve(result.secure_url);
        },
      );
      upload.end(buffer);
    });
  }
}
