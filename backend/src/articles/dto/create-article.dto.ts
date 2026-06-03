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
      'Manual sort priority. Lower numbers appear first. NULL means default date-based ordering.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return null;
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) ? n : null;
  })
  display_order?: number | null;

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
