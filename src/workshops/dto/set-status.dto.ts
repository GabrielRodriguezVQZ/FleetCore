import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ActiveStatus } from '../../common/enums.js';

/** Body to activate/deactivate workshops and mechanics. */
export class SetActiveStatusDto {
  @ApiProperty({ enum: ActiveStatus })
  @IsEnum(ActiveStatus)
  status: ActiveStatus;
}
