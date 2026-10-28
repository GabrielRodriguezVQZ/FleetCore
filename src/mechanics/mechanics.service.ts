import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveStatus, Role } from '../common/enums.js';
import { Maintenance } from '../maintenances/maintenance.entity.js';
import { User } from '../users/user.entity.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { Mechanic } from './mechanic.entity.js';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(Mechanic) private readonly mechanics: Repository<Mechanic>,
    @InjectRepository(Maintenance) private readonly maintenances: Repository<Maintenance>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(dto: CreateMechanicDto) {
    await this.assertEmailFree(dto.email);
    if (dto.userId !== undefined) await this.assertUserLinkable(dto.userId);
    return this.mechanics.save(this.mechanics.create(dto));
  }

  findAll() {
    return this.mechanics.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const mechanic = await this.mechanics.findOneBy({ id });
    if (!mechanic) throw new NotFoundException(`El mecánico con id ${id} no existe`);
    return mechanic;
  }

  async update(id: number, dto: UpdateMechanicDto) {
    const mechanic = await this.findOne(id);
    if (dto.email && dto.email !== mechanic.email) await this.assertEmailFree(dto.email);
    if (dto.userId !== undefined && dto.userId !== mechanic.userId) {
      await this.assertUserLinkable(dto.userId);
    }
    return this.mechanics.save(Object.assign(mechanic, dto));
  }

  /** Activates or deactivates. An inactive mechanic keeps all their history. */
  setStatus(id: number, status: ActiveStatus) {
    return this.update(id, { status });
  }

  inactivate(id: number) {
    return this.setStatus(id, ActiveStatus.INACTIVE);
  }

  /** Maintenances assigned to a mechanic (active and past ones). */
  async maintenancesOf(id: number) {
    const mechanic = await this.findOne(id);
    const maintenances = await this.maintenances.find({
      where: { mechanicId: id },
      relations: { vehicle: true, workshop: true },
      order: { scheduledAt: 'DESC' },
    });
    return { mechanic, maintenances };
  }

  private async assertEmailFree(email: string) {
    if (await this.mechanics.existsBy({ email })) {
      throw new ConflictException(`Ya existe un mecánico con el correo ${email}`);
    }
  }

  private async assertUserLinkable(userId: number) {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(`El usuario con id ${userId} no existe`);
    if (user.role !== Role.TECHNICIAN) {
      throw new BadRequestException('Solo se puede vincular un usuario con rol TECHNICIAN');
    }
    if (await this.mechanics.existsBy({ userId })) {
      throw new ConflictException('Ese usuario ya está vinculado a otro mecánico');
    }
  }
}
