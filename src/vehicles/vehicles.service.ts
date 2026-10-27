import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ACTIVE_MAINTENANCE_STATUSES, MaintenanceStatus, VehicleStatus } from '../common/enums.js';
import { Maintenance } from '../maintenances/maintenance.entity.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { Vehicle } from './vehicle.entity.js';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(Maintenance) private readonly maintenances: Repository<Maintenance>,
  ) {}

  async create(dto: CreateVehicleDto) {
    if (dto.status === VehicleStatus.IN_MAINTENANCE) {
      throw new BadRequestException(
        'El estado IN_MAINTENANCE se asigna automáticamente al iniciar un mantenimiento',
      );
    }
    await this.assertPlateFree(dto.plate);
    return this.vehicles.save(this.vehicles.create(dto));
  }

  findAll() {
    return this.vehicles.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const vehicle = await this.vehicles.findOneBy({ id });
    if (!vehicle) throw new NotFoundException(`El vehículo con id ${id} no existe`);
    return vehicle;
  }

  async findByPlate(plate: string) {
    const normalized = plate.trim().toUpperCase();
    const vehicle = await this.vehicles.findOneBy({ plate: normalized });
    if (!vehicle) throw new NotFoundException(`El vehículo con placa ${normalized} no existe`);
    return vehicle;
  }

  async update(id: number, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(id);

    if (dto.plate && dto.plate !== vehicle.plate) await this.assertPlateFree(dto.plate);
    if (dto.mileage !== undefined && dto.mileage < vehicle.mileage) {
      throw new BadRequestException(
        `El kilometraje (${dto.mileage}) no puede ser menor al actual (${vehicle.mileage})`,
      );
    }
    if (dto.status !== undefined && dto.status !== vehicle.status) {
      await this.assertManualStatusChange(vehicle, dto.status);
    }

    return this.vehicles.save(Object.assign(vehicle, dto));
  }

  /** Eliminación lógica: pasa a INACTIVE; los mantenimientos históricos se conservan. */
  async inactivate(id: number) {
    return this.update(id, { status: VehicleStatus.INACTIVE });
  }

  /** Historial: mantenimientos COMPLETED del vehículo, del más reciente al más antiguo. */
  async history(id: number) {
    const vehicle = await this.findOne(id);
    const maintenances = await this.maintenances.find({
      where: { vehicleId: id, status: MaintenanceStatus.COMPLETED },
      relations: { mechanic: true, workshop: true },
      order: { finishedAt: 'DESC' },
    });
    return { vehicle, maintenances };
  }

  private async assertPlateFree(plate: string) {
    if (await this.vehicles.existsBy({ plate })) {
      throw new ConflictException(`Ya existe un vehículo con la placa ${plate}`);
    }
  }

  /**
   * El estado IN_MAINTENANCE / AVAILABLE lo gobiernan los mantenimientos.
   * Manualmente solo se permite inactivar o reactivar, y nunca con un
   * mantenimiento activo de por medio.
   */
  private async assertManualStatusChange(vehicle: Vehicle, next: VehicleStatus) {
    if (next === VehicleStatus.IN_MAINTENANCE) {
      throw new BadRequestException(
        'El estado IN_MAINTENANCE se asigna automáticamente al iniciar un mantenimiento',
      );
    }
    const hasActive = await this.maintenances.existsBy({
      vehicleId: vehicle.id,
      status: In(ACTIVE_MAINTENANCE_STATUSES),
    });
    if (hasActive || vehicle.status === VehicleStatus.IN_MAINTENANCE) {
      throw new ConflictException(
        `El vehículo ${vehicle.plate} tiene un mantenimiento activo; no se puede cambiar su estado manualmente`,
      );
    }
  }
}
