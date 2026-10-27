import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity.js';
import { FindAuditsDto } from './dto/find-audits.dto.js';

@Injectable()
export class AuditsService {
  constructor(@InjectRepository(AuditLog) private readonly audits: Repository<AuditLog>) {}

  record(entry: Partial<AuditLog>) {
    return this.audits.save(this.audits.create(entry));
  }

  /** Lista los registros más recientes primero, con filtros opcionales. */
  findAll({ limit = 100, ...filters }: FindAuditsDto) {
    // TypeORM rechaza `undefined` en el where: solo se pasan los filtros enviados.
    const where = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined),
    );
    return this.audits.find({
      where,
      order: { createdAt: 'DESC', id: 'DESC' },
      take: limit,
    });
  }
}
