import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mechanic } from '../mechanics/mechanic.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';
import { Workshop } from '../workshops/workshop.entity.js';
import { MaintenancesController } from './maintenances.controller.js';
import { MaintenancesService } from './maintenances.service.js';
import { Maintenance } from './maintenance.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Maintenance, Vehicle, Mechanic, Workshop])],
  controllers: [MaintenancesController],
  providers: [MaintenancesService],
})
export class MaintenancesModule {}
