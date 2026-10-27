import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../enums.js';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  entity: string;
  action: AuditAction;
}

/** Marca la ruta para que el AuditInterceptor registre la operación cuando tenga éxito. */
export const Audit = (entity: string, action: AuditAction) =>
  SetMetadata(AUDIT_KEY, { entity, action } satisfies AuditMetadata);
