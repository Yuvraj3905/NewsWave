import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from './translation.dto';

export class ListArticlesDto {
  @ApiPropertyOptional({ enum: SUPPORTED_LANGUAGES, default: 'en' })
  @IsOptional()
  @IsIn(SUPPORTED_LANGUAGES as unknown as string[])
  lang?: SupportedLanguage = 'en';

  @ApiPropertyOptional({ description: 'Category slug or id' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Location slug or id' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Search title' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Include unpublished (manager only)',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeUnpublished?: boolean = false;

  @ApiPropertyOptional({
    description: 'Filter: display date >= ISO timestamp (uses published_at, falls back to created_at).',
  })
  @IsOptional()
  @IsISO8601()
  date_from?: string;

  @ApiPropertyOptional({
    description: 'Filter: display date <= ISO timestamp.',
  })
  @IsOptional()
  @IsISO8601()
  date_to?: string;
}
