import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ActiveStatus } from '../../common/enums.js';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'Taller Centro' })
  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'Calle 45 # 12-30, Barranquilla' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  address: string;

  @ApiPropertyOptional({ enum: ActiveStatus, default: ActiveStatus.ACTIVE })
  @IsOptional() @IsEnum(ActiveStatus)
  status?: ActiveStatus;
}
