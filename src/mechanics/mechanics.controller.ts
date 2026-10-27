import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../common/decorators/audit.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AuditAction, Role } from '../common/enums.js';
import { SetActiveStatusDto } from '../workshops/dto/set-status.dto.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { MechanicsService } from './mechanics.service.js';

@ApiTags('Mechanics')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  @Audit('Mechanic', AuditAction.CREATE)
  create(@Body() dto: CreateMechanicDto) {
    return this.mechanicsService.create(dto);
  }

  @Get()
  findAll() {
    return this.mechanicsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mechanicsService.findOne(id);
  }

  @Get(':id/maintenances')
  maintenancesOf(@Param('id', ParseIntPipe) id: number) {
    return this.mechanicsService.maintenancesOf(id);
  }

  @Patch(':id')
  @Audit('Mechanic', AuditAction.UPDATE)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMechanicDto) {
    return this.mechanicsService.update(id, dto);
  }

  @Patch(':id/status')
  @Audit('Mechanic', AuditAction.STATUS_CHANGE)
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: SetActiveStatusDto) {
    return this.mechanicsService.setStatus(id, dto.status);
  }

  /** Eliminación lógica (inactivación). */
  @Delete(':id')
  @Audit('Mechanic', AuditAction.INACTIVATE)
  inactivate(@Param('id', ParseIntPipe) id: number) {
    return this.mechanicsService.inactivate(id);
  }
}
