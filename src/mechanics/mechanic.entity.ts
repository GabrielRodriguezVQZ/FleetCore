import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ActiveStatus } from '../common/enums.js';
import { Maintenance } from '../maintenances/maintenance.entity.js';
import { User } from '../users/user.entity.js';

@Entity('mechanics')
export class Mechanic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  specialty: string;

  @Column({ type: 'enum', enum: ActiveStatus, default: ActiveStatus.ACTIVE })
  status: ActiveStatus;

  /** Linked TECHNICIAN user (optional). It lets a technician see "their" maintenances. */
  @Column({ type: 'int', nullable: true, unique: true })
  userId: number | null;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User> | null;

  /** A mechanic does NOT belong to one fixed workshop: they are linked through maintenances. */
  @OneToMany(() => Maintenance, (maintenance) => maintenance.mechanic)
  maintenances: Relation<Maintenance[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
