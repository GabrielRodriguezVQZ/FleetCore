import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ActiveStatus } from '../../common/enums.js';

export class CreateMechanicDto {
  @ApiProperty({ example: 'Carlos Pérez' })
  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'carlos@fleetcore.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Frenos y suspensión' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  specialty: string;

  @ApiPropertyOptional({ enum: ActiveStatus, default: ActiveStatus.ACTIVE })
  @IsOptional() @IsEnum(ActiveStatus)
  status?: ActiveStatus;

  @ApiPropertyOptional({ example: 2, description: 'Id de un usuario TECHNICIAN a vincular' })
  @IsOptional() @IsInt()
  userId?: number;
}
