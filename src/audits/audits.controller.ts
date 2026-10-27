import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums.js';
import { AuditsService } from './audits.service.js';
import { FindAuditsDto } from './dto/find-audits.dto.js';

@ApiTags('Audits')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Get()
  findAll(@Query() query: FindAuditsDto) {
    return this.auditsService.findAll(query);
  }
}
