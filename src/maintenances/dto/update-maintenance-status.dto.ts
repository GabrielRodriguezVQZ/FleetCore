import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MaintenanceStatus } from '../../common/enums.js';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({ enum: MaintenanceStatus, example: MaintenanceStatus.IN_PROGRESS })
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;

  // Los 4 campos siguientes son obligatorios únicamente al pasar a COMPLETED.
  @ApiPropertyOptional({ example: 'Cambio de aceite y filtros' })
  @IsOptional() @IsString() @IsNotEmpty()
  workDone?: string;

  @ApiPropertyOptional({ example: 350000 })
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  finalCost?: number;

  @ApiPropertyOptional({ example: '2026-11-03T09:00:00.000Z' })
  @IsOptional() @IsDateString()
  finishedAt?: string;

  @ApiPropertyOptional({ example: 45120 })
  @IsOptional() @IsInt() @Min(0)
  finalMileage?: number;
}
