import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveStatus } from '../common/enums.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { Workshop } from './workshop.entity.js';

@Injectable()
export class WorkshopsService {
  constructor(@InjectRepository(Workshop) private readonly workshops: Repository<Workshop>) {}

  async create(dto: CreateWorkshopDto) {
    await this.assertNameFree(dto.name);
    return this.workshops.save(this.workshops.create(dto));
  }

  /** By default it lists only active workshops. */
  findAll(includeInactive = false) {
    return this.workshops.find({
      where: includeInactive ? {} : { status: ActiveStatus.ACTIVE },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const workshop = await this.workshops.findOneBy({ id });
    if (!workshop) throw new NotFoundException(`El taller con id ${id} no existe`);
    return workshop;
  }

  async update(id: number, dto: UpdateWorkshopDto) {
    const workshop = await this.findOne(id);
    if (dto.name && dto.name !== workshop.name) await this.assertNameFree(dto.name);
    return this.workshops.save(Object.assign(workshop, dto));
  }

  setStatus(id: number, status: ActiveStatus) {
    return this.update(id, { status });
  }

  /** Soft delete: deactivates the workshop and keeps its maintenances. */
  inactivate(id: number) {
    return this.setStatus(id, ActiveStatus.INACTIVE);
  }

  private async assertNameFree(name: string) {
    if (await this.workshops.existsBy({ name })) {
      throw new ConflictException(`Ya existe un taller con el nombre ${name}`);
    }
  }
}
