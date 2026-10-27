import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maintenance } from '../maintenances/maintenance.entity.js';
import { Vehicle } from './vehicle.entity.js';
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Maintenance])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [TypeOrmModule],
})
export class VehiclesModule {}
