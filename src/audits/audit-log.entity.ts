import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { AuditAction, Role } from '../common/enums.js';
import { User } from '../users/user.entity.js';

/** A record that never changes, saved for each write operation in the API. */
@Entity('audit_logs')
@Index(['entity', 'entityId'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  /** Changed entity: Vehicle, Mechanic, Workshop, Maintenance, User. */
  @Column({ type: 'varchar', length: 40 })
  entity: string;

  @Column({ type: 'int', nullable: true })
  entityId: number | null;

  /** User who did the operation (null for public operations like sign up). */
  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User> | null;

  // Copy of the email and role at the time of the operation: the record is
  // still easy to read even if the user changes later.
  @Column({ type: 'varchar', length: 160, nullable: true })
  userEmail: string | null;

  @Column({ type: 'enum', enum: Role, nullable: true })
  userRole: Role | null;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'varchar', length: 200 })
  path: string;

  /** Request body that was sent (without passwords). */
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
