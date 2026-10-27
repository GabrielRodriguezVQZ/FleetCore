import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maintenance } from '../maintenances/maintenance.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';
import { IntegrationsController } from './integrations.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Maintenance])],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
