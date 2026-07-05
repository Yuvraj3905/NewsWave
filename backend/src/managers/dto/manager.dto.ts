import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { MANAGER_ROLES, ManagerRole } from '../manager.entity';

export class CreateManagerDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: MANAGER_ROLES })
  @IsIn(MANAGER_ROLES)
  role: ManagerRole;
}

export class UpdateManagerDto {
  @ApiPropertyOptional({ description: 'New password (min 6 chars)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: MANAGER_ROLES })
  @IsOptional()
  @IsIn(MANAGER_ROLES)
  role?: ManagerRole;
}
