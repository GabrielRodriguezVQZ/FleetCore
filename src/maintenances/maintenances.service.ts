import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { AuthUser } from '../common/auth-user.js';
import {
  ACTIVE_MAINTENANCE_STATUSES,
  ActiveStatus,
  MaintenanceStatus,
  Role,
  VehicleStatus,
} from '../common/enums.js';
import { Mechanic } from '../mechanics/mechanic.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';
import { Workshop } from '../workshops/workshop.entity.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto.js';
import { Maintenance } from './maintenance.entity.js';

/**
 * Máquina de estados: estado actual -> estados a los que puede pasar.
 * COMPLETED y CANCELLED son terminales (no hay vuelta atrás).
 */
const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MaintenanceStatus.SCHEDULED]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED],
  [MaintenanceStatus.IN_PROGRESS]: [MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED],
  [MaintenanceStatus.COMPLETED]: [],
  [MaintenanceStatus.CANCELLED]: [],
};

const RELATIONS = { vehicle: true, mechanic: true, workshop: true } as const;

@Injectable()
export class MaintenancesService {
  constructor(
    @InjectRepository(Maintenance) private readonly maintenances: Repository<Maintenance>,
    @InjectRepository(Mechanic) private readonly mechanics: Repository<Mechanic>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  /**
   * TRANSACCIÓN: se bloquean (SELECT ... FOR UPDATE) el vehículo y el mecánico
   * para que dos peticiones simultáneas no puedan crear mantenimientos
   * activos duplicados o con horarios cruzados.
   */
  create(dto: CreateMaintenanceDto) {
    const start = new Date(dto.scheduledAt);
    const end = new Date(dto.scheduledEndAt);
    if (end <= start) {
      throw new BadRequestException('La fecha de fin programada debe ser posterior al inicio');
    }

    return this.dataSource.transaction(async (manager) => {
      const vehicle = await manager.findOne(Vehicle, {
        where: { id: dto.vehicleId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!vehicle) throw new NotFoundException(`El vehículo con id ${dto.vehicleId} no existe`);
      if (vehicle.status === VehicleStatus.INACTIVE) {
        throw new ConflictException(`El vehículo ${vehicle.plate} está inactivo y no admite nuevos mantenimientos`);
      }

      const mechanic = await manager.findOne(Mechanic, {
        where: { id: dto.mechanicId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!mechanic) throw new NotFoundException(`El mecánico con id ${dto.mechanicId} no existe`);
      if (mechanic.status !== ActiveStatus.ACTIVE) {
        throw new ConflictException(`El mecánico ${mechanic.name} está inactivo y no puede recibir mantenimientos`);
      }

      const workshop = await manager.findOneBy(Workshop, { id: dto.workshopId });
      if (!workshop) throw new NotFoundException(`El taller con id ${dto.workshopId} no existe`);
      if (workshop.status !== ActiveStatus.ACTIVE) {
        throw new ConflictException(`El taller ${workshop.name} está inactivo`);
      }

      if (dto.mileage < vehicle.mileage) {
        throw new BadRequestException(
          `El kilometraje (${dto.mileage}) no puede ser inferior al actual del vehículo (${vehicle.mileage})`,
        );
      }

      // Regla: un vehículo no puede tener más de un mantenimiento activo.
      const vehicleBusy = await manager.existsBy(Maintenance, {
        vehicleId: vehicle.id,
        status: In(ACTIVE_MAINTENANCE_STATUSES),
      });
      if (vehicleBusy) {
        throw new ConflictException(`El vehículo ${vehicle.plate} ya tiene un mantenimiento activo`);
      }

      // Regla: el mecánico no puede tener mantenimientos activos cuyos horarios se crucen
      // (en cualquier taller). Intervalos semiabiertos [inicio, fin): terminar a las 9:00 y
      // empezar a las 9:00 NO es cruce.
      const overlapping = await this.findMechanicOverlap(manager, mechanic.id, start, end);
      if (overlapping) {
        throw new ConflictException(
          `El mecánico ${mechanic.name} ya tiene un mantenimiento activo que se cruza con ese horario`,
        );
      }

      const maintenance = manager.create(Maintenance, {
        type: dto.type,
        description: dto.description,
        mileage: dto.mileage,
        scheduledAt: start,
        scheduledEndAt: end,
        status: MaintenanceStatus.SCHEDULED, // estado inicial fijo
        vehicleId: vehicle.id,
        mechanicId: mechanic.id,
        workshopId: workshop.id,
      });
      const saved = await manager.save(maintenance);
      return manager.findOneOrFail(Maintenance, { where: { id: saved.id }, relations: RELATIONS });
    });
  }

  private findMechanicOverlap(manager: EntityManager, mechanicId: number, start: Date, end: Date) {
    return manager
      .createQueryBuilder(Maintenance, 'm')
      .where('m.mechanicId = :mechanicId', { mechanicId })
      .andWhere('m.status IN (:...active)', { active: ACTIVE_MAINTENANCE_STATUSES })
      .andWhere('m.scheduledAt < :end AND m.scheduledEndAt > :start', { start, end })
      .getOne();
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  findAll() {
    return this.maintenances.find({ relations: RELATIONS, order: { scheduledAt: 'DESC' } });
  }

  findActive() {
    return this.maintenances.find({
      where: { status: In(ACTIVE_MAINTENANCE_STATUSES) },
      relations: RELATIONS,
      order: { scheduledAt: 'ASC' },
    });
  }

  findByVehicle(vehicleId: number) {
    return this.maintenances.find({
      where: { vehicleId },
      relations: RELATIONS,
      order: { scheduledAt: 'DESC' },
    });
  }

  findByMechanic(mechanicId: number) {
    return this.maintenances.find({
      where: { mechanicId },
      relations: RELATIONS,
      order: { scheduledAt: 'DESC' },
    });
  }

  /** Mantenimientos asignados al técnico autenticado (vía su mecánico vinculado). */
  async findMine(user: AuthUser) {
    const mechanic = await this.mechanics.findOneBy({ userId: user.id });
    if (!mechanic) return [];
    return this.findByMechanic(mechanic.id);
  }

  async findOne(id: number, user?: AuthUser) {
    const maintenance = await this.maintenances.findOne({ where: { id }, relations: RELATIONS });
    if (!maintenance) throw new NotFoundException(`El mantenimiento con id ${id} no existe`);
    await this.assertAccess(maintenance, user);
    return maintenance;
  }

  /** Un TECHNICIAN solo puede ver/modificar los mantenimientos de su mecánico. */
  private async assertAccess(maintenance: Maintenance, user?: AuthUser) {
    if (!user || user.role === Role.ADMIN) return;
    const mine = maintenance.mechanic?.userId === user.id;
    if (!mine) throw new ForbiddenException('Este mantenimiento no está asignado a tu usuario');
  }

  // ------------------------------------------------------------------
  // UPDATE STATUS
  // ------------------------------------------------------------------
  /**
   * TRANSACCIÓN: el cambio de estado del mantenimiento y el del vehículo se
   * confirman juntos (o ninguno). Se valida la transición, los datos de cierre
   * y se sincroniza la disponibilidad del vehículo:
   *   IN_PROGRESS -> vehículo IN_MAINTENANCE
   *   COMPLETED   -> vehículo AVAILABLE (+ kilometraje final)
   *   CANCELLED   -> vehículo AVAILABLE si estaba IN_MAINTENANCE
   */
  async updateStatus(id: number, dto: UpdateMaintenanceStatusDto, user: AuthUser) {
    await this.findOne(id, user); // 404 / 403 antes de abrir la transacción

    return this.dataSource.transaction(async (manager) => {
      const maintenance = await manager.findOne(Maintenance, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!maintenance) throw new NotFoundException(`El mantenimiento con id ${id} no existe`);

      const vehicle = await manager.findOneOrFail(Vehicle, {
        where: { id: maintenance.vehicleId },
        lock: { mode: 'pessimistic_write' },
      });

      const from = maintenance.status;
      const to = dto.status;
      if (!ALLOWED_TRANSITIONS[from].includes(to)) {
        const allowed = ALLOWED_TRANSITIONS[from];
        throw new ConflictException(
          `Transición inválida: un mantenimiento ${from} no puede pasar a ${to}. ` +
            (allowed.length ? `Estados permitidos: ${allowed.join(', ')}` : `${from} es un estado final`),
        );
      }

      if (to === MaintenanceStatus.COMPLETED) {
        this.applyClosingData(maintenance, vehicle, dto);
        vehicle.status = VehicleStatus.AVAILABLE;
        vehicle.mileage = maintenance.finalMileage as number;
      } else if (to === MaintenanceStatus.IN_PROGRESS) {
        vehicle.status = VehicleStatus.IN_MAINTENANCE;
      } else if (to === MaintenanceStatus.CANCELLED && vehicle.status === VehicleStatus.IN_MAINTENANCE) {
        vehicle.status = VehicleStatus.AVAILABLE;
      }

      maintenance.status = to;
      await manager.save(vehicle);
      await manager.save(maintenance);
      return manager.findOneOrFail(Maintenance, { where: { id }, relations: RELATIONS });
    });
  }

  /** Exige y aplica los datos obligatorios de cierre. */
  private applyClosingData(maintenance: Maintenance, vehicle: Vehicle, dto: UpdateMaintenanceStatusDto) {
    const missing: string[] = [];
    if (!dto.workDone?.trim()) missing.push('workDone (trabajo realizado)');
    if (dto.finalCost === undefined) missing.push('finalCost (costo final)');
    if (!dto.finishedAt) missing.push('finishedAt (fecha de finalización)');
    if (dto.finalMileage === undefined) missing.push('finalMileage (kilometraje final)');
    if (missing.length) {
      throw new BadRequestException(`Para completar el mantenimiento faltan: ${missing.join(', ')}`);
    }

    const minMileage = Math.max(vehicle.mileage, maintenance.mileage);
    if ((dto.finalMileage as number) < minMileage) {
      throw new BadRequestException(
        `El kilometraje final (${dto.finalMileage}) no puede ser inferior al registrado (${minMileage})`,
      );
    }

    maintenance.workDone = (dto.workDone as string).trim();
    maintenance.finalCost = dto.finalCost as number;
    maintenance.finishedAt = new Date(dto.finishedAt as string);
    maintenance.finalMileage = dto.finalMileage as number;
  }
}
