import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../common/decorators/audit.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AuditAction, Role } from '../common/enums.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { VehiclesService } from './vehicles.service.js';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Audit('Vehicle', AuditAction.CREATE)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  // Rutas estáticas antes que ':id' para que no se confundan.
  @Get('plate/:plate')
  findByPlate(@Param('plate') plate: string) {
    return this.vehiclesService.findByPlate(plate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @Get(':id/maintenances')
  @Roles(Role.ADMIN)
  history(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.history(id);
  }

  @Patch(':id')
  @Audit('Vehicle', AuditAction.UPDATE)
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  /** Eliminación lógica (inactivación). */
  @Delete(':id')
  @Audit('Vehicle', AuditAction.INACTIVATE)
  @Roles(Role.ADMIN)
  inactivate(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.inactivate(id);
  }
}
