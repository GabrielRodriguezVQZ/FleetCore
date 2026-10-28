import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity.js';
import { AuditsController } from './audits.controller.js';
import { AuditsService } from './audits.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditsController],
  providers: [AuditsService],
  // The global AuditInterceptor (registered in AppModule) uses AuditsService.
  exports: [AuditsService],
})
export class AuditsModule {}
