import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity.js';
import { AuditsController } from './audits.controller.js';
import { AuditsService } from './audits.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditsController],
  providers: [AuditsService],
  // El AuditInterceptor global (registrado en AppModule) usa AuditsService.
  exports: [AuditsService],
})
export class AuditsModule {}
