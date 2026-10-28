import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../enums.js';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  entity: string;
  action: AuditAction;
}

/** Marks the route so the AuditInterceptor saves the operation when it works. */
export const Audit = (entity: string, action: AuditAction) =>
  SetMetadata(AUDIT_KEY, { entity, action } satisfies AuditMetadata);
