import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

const toArray = ({ value }: { value: any }): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    if (value.trim().startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const toBool = ({ value }: { value: any }): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
};

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'Hero image by URL. Used when no file is uploaded.',
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(toArray)
  category_ids?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(toArray)
  location_ids?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(toBool)
  published?: boolean;

  @ApiPropertyOptional({
    description:
      'Custom display publish date/time (ISO 8601). Falls back to created_at when omitted.',
  })
  @IsOptional()
  @IsISO8601()
  published_at?: string;

  @ApiPropertyOptional({
    description:
      'Auto-publish date/time (ISO 8601). When set to a future time the article is saved as unpublished and goes live automatically at this time. Send an empty string to clear a schedule.',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsISO8601()
  scheduled_at?: string | null;

  @ApiPropertyOptional({
    description:
      'Manual sort priority. Lower numbers appear first. NULL means default date-based ordering.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return null;
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) ? n : null;
  })
  display_order?: number | null;

  @ApiPropertyOptional({
    description:
      'Custom URL slug. Auto-generated from the title when omitted. Editing on an existing article changes its public URL.',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'SEO title tag override (falls back to title).' })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description override (falls back to description).',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({ description: 'Focus keyword for on-page SEO checks.' })
  @IsOptional()
  @IsString()
  focus_keyword?: string;

  @ApiPropertyOptional({ description: 'Canonical URL override.' })
  @IsOptional()
  @IsString()
  canonical_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(toBool)
  post_to_x?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(toBool)
  post_to_facebook?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(toBool)
  post_to_instagram?: boolean;
}
