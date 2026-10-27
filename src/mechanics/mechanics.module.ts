import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maintenance } from '../maintenances/maintenance.entity.js';
import { User } from '../users/user.entity.js';
import { Mechanic } from './mechanic.entity.js';
import { MechanicsController } from './mechanics.controller.js';
import { MechanicsService } from './mechanics.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Mechanic, Maintenance, User])],
  controllers: [MechanicsController],
  providers: [MechanicsService],
  exports: [TypeOrmModule],
})
export class MechanicsModule {}
