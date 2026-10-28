import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module.js';
import { hashPassword } from '../auth/password.js';
import {
  ActiveStatus,
  MaintenanceStatus,
  MaintenanceType,
  Role,
  VehicleStatus,
} from '../common/enums.js';
import { Maintenance } from '../maintenances/maintenance.entity.js';
import { Mechanic } from '../mechanics/mechanic.entity.js';
import { User } from '../users/user.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';
import { Workshop } from '../workshops/workshop.entity.js';

/**
 * Safe to run many times: each record is searched by its natural key
 * (email, plate, name) and is only created if it does not exist. Running it
 * many times does NOT create duplicate data.
 *
 * Usage: npm run seed
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const dataSource = app.get(DataSource);
  const config = app.get(ConfigService);

  await dataSource.transaction(async (manager) => {
    /** Searches by `where`; if it does not exist, it creates it. */
    async function findOrCreate<T extends object>(
      entity: new () => T,
      where: Partial<T>,
      data: Partial<T>,
    ): Promise<T> {
      const existing = await manager.findOneBy(entity, where as any);
      if (existing) return existing;
      return manager.save(manager.create(entity, { ...where, ...data } as any)) as Promise<T>;
    }

    // ---- Users: 1 ADMIN + 2 TECHNICIAN ----
    const adminEmail = String(config.get('ADMIN_EMAIL')).toLowerCase();
    const admin = await findOrCreate(User, { email: adminEmail }, {
      name: 'Administrador FleetCore',
      role: Role.ADMIN,
      password: await hashPassword(String(config.get('ADMIN_PASSWORD'))),
    });
    const techPassword = await hashPassword('Tecnico123*');
    const tech1 = await findOrCreate(User, { email: 'tecnico1@fleetcore.com' }, {
      name: 'Carlos Pérez', role: Role.TECHNICIAN, password: techPassword,
    });
    const tech2 = await findOrCreate(User, { email: 'tecnico2@fleetcore.com' }, {
      name: 'Laura Gómez', role: Role.TECHNICIAN, password: techPassword,
    });

    // ---- Mechanics: 2 active (linked to the technicians) + 1 inactive ----
    // Linked ones are searched by userId (unique): this way they are not duplicated
    // even if their email is changed later from the API.
    const carlos = await findOrCreate(Mechanic, { userId: tech1.id }, {
      name: 'Carlos Pérez', email: 'carlos.perez@fleetcore.com', specialty: 'Motor y transmisión', status: ActiveStatus.ACTIVE,
    });
    const laura = await findOrCreate(Mechanic, { userId: tech2.id }, {
      name: 'Laura Gómez', email: 'laura.gomez@fleetcore.com', specialty: 'Frenos y suspensión', status: ActiveStatus.ACTIVE,
    });
    await findOrCreate(Mechanic, { email: 'pedro.ruiz@fleetcore.com' }, {
      name: 'Pedro Ruiz', specialty: 'Electricidad automotriz', status: ActiveStatus.INACTIVE, userId: null,
    });

    // ---- Workshops: 1 active + 1 inactive ----
    const centro = await findOrCreate(Workshop, { name: 'Taller Centro' }, {
      address: 'Calle 45 # 12-30, Barranquilla', status: ActiveStatus.ACTIVE,
    });
    const norte = await findOrCreate(Workshop, { name: 'Taller Norte' }, {
      address: 'Carrera 51B # 80-20, Barranquilla', status: ActiveStatus.INACTIVE,
    });

    // ---- Vehicles: 2 AVAILABLE, 1 IN_MAINTENANCE, 1 INACTIVE ----
    const abc = await findOrCreate(Vehicle, { plate: 'ABC123' }, {
      brand: 'Chevrolet', model: 'NPR', year: 2021, mileage: 52300, status: VehicleStatus.AVAILABLE,
    });
    await findOrCreate(Vehicle, { plate: 'DEF456' }, {
      brand: 'Hino', model: '300', year: 2022, mileage: 18000, status: VehicleStatus.AVAILABLE,
    });
    const ghi = await findOrCreate(Vehicle, { plate: 'GHI789' }, {
      brand: 'Isuzu', model: 'FRR', year: 2020, mileage: 80500, status: VehicleStatus.IN_MAINTENANCE,
    });
    await findOrCreate(Vehicle, { plate: 'JKL012' }, {
      brand: 'Kenworth', model: 'T800', year: 2015, mileage: 310000, status: VehicleStatus.INACTIVE,
    });

    // ---- Maintenances ----
    // IN_PROGRESS for the IN_MAINTENANCE vehicle (GHI789).
    await findOrCreate(Maintenance, { vehicleId: ghi.id, status: MaintenanceStatus.IN_PROGRESS }, {
      type: MaintenanceType.CORRECTIVE,
      description: 'Reparación de caja de cambios',
      mileage: 80500,
      scheduledAt: new Date('2026-10-26T13:00:00.000Z'),
      scheduledEndAt: new Date('2026-10-26T17:00:00.000Z'),
      mechanicId: carlos.id,
      workshopId: centro.id,
    });
    // COMPLETED to show history (ABC123).
    await findOrCreate(Maintenance, { vehicleId: abc.id, status: MaintenanceStatus.COMPLETED }, {
      type: MaintenanceType.PREVENTIVE,
      description: 'Cambio de aceite y filtros',
      mileage: 52000,
      scheduledAt: new Date('2026-10-10T12:00:00.000Z'),
      scheduledEndAt: new Date('2026-10-10T14:00:00.000Z'),
      workDone: 'Cambio de aceite y filtros',
      finalCost: 350000,
      finishedAt: new Date('2026-10-10T14:00:00.000Z'),
      finalMileage: 52300,
      mechanicId: laura.id,
      workshopId: norte.id,
    });

    void admin;
  });

  console.log('Seed completado (idempotente).');
  console.log('  ADMIN:      ', process.env.ADMIN_EMAIL ?? config.get('ADMIN_EMAIL'));
  console.log('  TECHNICIAN: tecnico1@fleetcore.com / tecnico2@fleetcore.com  (clave: Tecnico123*)');
  await app.close();
}

await seed();
