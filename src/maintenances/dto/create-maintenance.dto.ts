import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { MaintenanceType } from '../../common/enums.js';

export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType, example: MaintenanceType.PREVENTIVE })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty({ example: 'Cambio de aceite y filtros' })
  @IsString() @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 45000, description: 'Kilometraje; no puede ser menor al actual del vehículo' })
  @IsInt() @Min(0)
  mileage: number;

  @ApiProperty({ example: '2026-11-03T07:30:00.000Z', description: 'Inicio programado' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: '2026-11-03T09:00:00.000Z', description: 'Fin programado (debe ser posterior al inicio)' })
  @IsDateString()
  scheduledEndAt: string;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  vehicleId: number;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  mechanicId: number;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  workshopId: number;
}
