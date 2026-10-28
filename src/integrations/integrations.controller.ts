import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { Public } from '../common/decorators/public.decorator.js';
import { MaintenanceStatus, VehicleStatus } from '../common/enums.js';
import { ApiKeyGuard } from '../common/guards/api-key/api-key.guard.js';
import { Maintenance } from '../maintenances/maintenance.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';

/**
 * Endpoints for external integrations. They do NOT use JWT: they are @Public()
 * for the global guard, but they are protected by the ApiKeyGuard (x-api-key header).
 */
@ApiTags('Integrations')
@ApiSecurity('api-key')
@Public()
@UseGuards(ApiKeyGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(Maintenance) private readonly maintenances: Repository<Maintenance>,
  ) {}

  /** History of completed maintenances of a vehicle, searched by plate. */
  @Get('vehicles/:plate/maintenances')
  async history(@Param('plate') plate: string) {
    const normalized = plate.trim().toUpperCase();
    const vehicle = await this.vehicles.findOneBy({ plate: normalized });
    if (!vehicle) throw new NotFoundException(`El vehículo con placa ${normalized} no existe`);

    const maintenances = await this.maintenances.find({
      where: { vehicleId: vehicle.id, status: MaintenanceStatus.COMPLETED },
      relations: { mechanic: true, workshop: true },
      order: { finishedAt: 'DESC' },
    });

    return {
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        available: vehicle.status === VehicleStatus.AVAILABLE,
      },
      maintenances: maintenances.map((m) => ({
        id: m.id,
        type: m.type,
        status: m.status,
        description: m.workDone ?? m.description,
        mileage: m.finalMileage ?? m.mileage,
        cost: m.finalCost,
        finishedAt: m.finishedAt,
        mechanic: { id: m.mechanic.id, name: m.mechanic.name },
        workshop: { id: m.workshop.id, name: m.workshop.name },
      })),
    };
  }
}
