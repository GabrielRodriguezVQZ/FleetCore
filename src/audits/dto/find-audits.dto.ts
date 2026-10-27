import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AuditAction } from '../../common/enums.js';

export class FindAuditsDto {
  @ApiPropertyOptional({ example: 'Maintenance' })
  @IsOptional() @IsString()
  entity?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  entityId?: number;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional() @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ example: 1, description: 'Id del usuario que hizo la operación' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  userId?: number;

  @ApiPropertyOptional({ default: 100, maximum: 500 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500)
  limit?: number;
}
