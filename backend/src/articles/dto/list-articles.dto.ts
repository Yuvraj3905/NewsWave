import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
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
}
