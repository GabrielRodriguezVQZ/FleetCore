import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { AuditAction, Role } from '../common/enums.js';
import { User } from '../users/user.entity.js';

/** Registro inmutable de una operación de escritura realizada en la API. */
@Entity('audit_logs')
@Index(['entity', 'entityId'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  /** Entidad afectada: Vehicle, Mechanic, Workshop, Maintenance, User. */
  @Column({ type: 'varchar', length: 40 })
  entity: string;

  @Column({ type: 'int', nullable: true })
  entityId: number | null;

  /** Usuario que hizo la operación (null en operaciones públicas como el registro). */
  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User> | null;

  // Copia del correo y rol al momento de la operación: el registro sigue siendo
  // legible aunque el usuario cambie después.
  @Column({ type: 'varchar', length: 160, nullable: true })
  userEmail: string | null;

  @Column({ type: 'enum', enum: Role, nullable: true })
  userRole: Role | null;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'varchar', length: 200 })
  path: string;

  /** Body enviado (sin contraseñas). */
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
