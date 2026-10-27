import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../common/auth-user.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Audit } from '../common/decorators/audit.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AuditAction, Role } from '../common/enums.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto.js';
import { MaintenancesService } from './maintenances.service.js';

@ApiTags('Maintenances')
@ApiBearerAuth()
@Controller('maintenances')
export class MaintenancesController {
  constructor(private readonly maintenancesService: MaintenancesService) {}

  @Post()
  @Audit('Maintenance', AuditAction.CREATE)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenancesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.maintenancesService.findAll();
  }

  @Get('active')
  @Roles(Role.ADMIN)
  findActive() {
    return this.maintenancesService.findActive();
  }

  /** Mantenimientos asignados al técnico autenticado. */
  @Get('my')
  @Roles(Role.TECHNICIAN, Role.ADMIN)
  findMine(@CurrentUser() user: AuthUser) {
    return this.maintenancesService.findMine(user);
  }

  @Get('vehicle/:vehicleId')
  @Roles(Role.ADMIN)
  findByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.maintenancesService.findByVehicle(vehicleId);
  }

  @Get('mechanic/:mechanicId')
  @Roles(Role.ADMIN)
  findByMechanic(@Param('mechanicId', ParseIntPipe) mechanicId: number) {
    return this.maintenancesService.findByMechanic(mechanicId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.maintenancesService.findOne(id, user);
  }

  @Patch(':id/status')
  @Audit('Maintenance', AuditAction.STATUS_CHANGE)
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaintenanceStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.maintenancesService.updateStatus(id, dto, user);
  }
}
