import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ActiveStatus } from '../../common/enums.js';

/** Cuerpo para activar/inactivar talleres y mecánicos. */
export class SetActiveStatusDto {
  @ApiProperty({ enum: ActiveStatus })
  @IsEnum(ActiveStatus)
  status: ActiveStatus;
}
