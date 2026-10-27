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

  /** Usuario TECHNICIAN vinculado (opcional). Permite que un técnico vea "sus" mantenimientos. */
  @Column({ type: 'int', nullable: true, unique: true })
  userId: number | null;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User> | null;

  /** Un mecánico NO pertenece a un taller fijo: se relaciona vía mantenimientos. */
  @OneToMany(() => Maintenance, (maintenance) => maintenance.mechanic)
  maintenances: Relation<Maintenance[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
