import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MaintenanceStatus, MaintenanceType } from '../common/enums.js';
import { Mechanic } from '../mechanics/mechanic.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';
import { Workshop } from '../workshops/workshop.entity.js';

/** Postgres numeric comes as a string; we change it to a number. */
const numericTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value === null || value === undefined ? null : Number(value)),
};

@Entity('maintenances')
@Index(['mechanicId', 'status'])
@Index(['vehicleId', 'status'])
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MaintenanceType })
  type: MaintenanceType;

  @Column({ type: 'text' })
  description: string;

  /** Vehicle mileage when the maintenance is scheduled. */
  @Column({ type: 'int' })
  mileage: number;

  /** Time window [scheduledAt, scheduledEndAt): used so a mechanic has no overlapping jobs. */
  @Column({ type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ type: 'timestamptz' })
  scheduledEndAt: Date;

  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.SCHEDULED })
  status: MaintenanceStatus;

  // ---- Closing data (required to change to COMPLETED) ----
  @Column({ type: 'text', nullable: true })
  workDone: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: numericTransformer })
  finalCost: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  finalMileage: number | null;

  @Column({ type: 'int' })
  vehicleId: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.maintenances, { nullable: false })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Relation<Vehicle>;

  @Column({ type: 'int' })
  mechanicId: number;

  @ManyToOne(() => Mechanic, (mechanic) => mechanic.maintenances, { nullable: false })
  @JoinColumn({ name: 'mechanicId' })
  mechanic: Relation<Mechanic>;

  @Column({ type: 'int' })
  workshopId: number;

  @ManyToOne(() => Workshop, (workshop) => workshop.maintenances, { nullable: false })
  @JoinColumn({ name: 'workshopId' })
  workshop: Relation<Workshop>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
