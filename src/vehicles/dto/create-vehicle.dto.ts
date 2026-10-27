import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { VehicleStatus } from '../../common/enums.js';

const normalizePlate = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC123' })
  @Transform(normalizePlate)
  @IsString() @IsNotEmpty() @MaxLength(20)
  plate: string;

  @ApiProperty({ example: 'Chevrolet' })
  @IsString() @IsNotEmpty() @MaxLength(60)
  brand: string;

  @ApiProperty({ example: 'NPR' })
  @IsString() @IsNotEmpty() @MaxLength(60)
  model: string;

  @ApiProperty({ example: 2022 })
  @IsInt() @Min(1950) @Max(2100)
  year: number;

  @ApiProperty({ example: 45000 })
  @IsInt() @Min(0)
  mileage: number;

  @ApiPropertyOptional({ enum: [VehicleStatus.AVAILABLE, VehicleStatus.INACTIVE], default: VehicleStatus.AVAILABLE })
  @IsOptional() @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
