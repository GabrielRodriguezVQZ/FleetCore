import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MaintenanceStatus, MaintenanceType } from '../common/enums.js';
import { Mechanic } from '../mechanics/mechanic.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';
import { Workshop } from '../workshops/workshop.entity.js';

/** numeric de Postgres llega como string; lo convertimos a number. */
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

  /** Kilometraje del vehículo al programar el mantenimiento. */
  @Column({ type: 'int' })
  mileage: number;

  /** Ventana horaria [scheduledAt, scheduledEndAt): se usa para evitar cruces del mecánico. */
  @Column({ type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ type: 'timestamptz' })
  scheduledEndAt: Date;

  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.SCHEDULED })
  status: MaintenanceStatus;

  // ---- Datos de cierre (obligatorios para pasar a COMPLETED) ----
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
