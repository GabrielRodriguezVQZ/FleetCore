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

  /** Lists the newest records first, with optional filters. */
  findAll({ limit = 100, ...filters }: FindAuditsDto) {
    // TypeORM does not accept `undefined` in where: we only pass the filters that were sent.
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
