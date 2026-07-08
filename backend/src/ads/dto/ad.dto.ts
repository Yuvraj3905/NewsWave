import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AD_SLOTS, AD_TYPES, AdSlot, AdType } from '../ad.entity';

const toBool = ({ value }: { value: any }): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
};

export class CreateAdDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: AD_SLOTS })
  @IsIn(AD_SLOTS)
  slot: AdSlot;

  @ApiPropertyOptional({ enum: AD_TYPES, default: 'image' })
  @IsOptional()
  @IsIn(AD_TYPES)
  type?: AdType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  target_url?: string;

  @ApiPropertyOptional({ description: 'HTML/script snippet for ad-network ads.' })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(toBool)
  active?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Lower shows first.' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) ? n : undefined;
  })
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ description: 'Start showing at (ISO 8601).' })
  @IsOptional()
  @IsISO8601()
  starts_at?: string;

  @ApiPropertyOptional({ description: 'Stop showing at (ISO 8601).' })
  @IsOptional()
  @IsISO8601()
  ends_at?: string;
}

export class UpdateAdDto extends PartialType(CreateAdDto) {}
