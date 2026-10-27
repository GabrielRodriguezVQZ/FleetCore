export enum Role {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

/** Estado compartido por mecánicos y talleres. */
export enum ActiveStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/** Un mantenimiento está "activo" mientras esté programado o en proceso. */
export const ACTIVE_MAINTENANCE_STATUSES = [
  MaintenanceStatus.SCHEDULED,
  MaintenanceStatus.IN_PROGRESS,
];

/** Operaciones que quedan registradas en la auditoría. */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  INACTIVATE = 'INACTIVATE',
}
