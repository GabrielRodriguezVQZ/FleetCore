import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditsModule } from './audits/audits.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions/all-exceptions.filter.js';
import { JwtAuthGuard } from './common/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles/roles.guard.js';
import { AuditInterceptor } from './common/interceptors/audit/audit.interceptor.js';
import { LoggingInterceptor } from './common/interceptors/logging/logging.interceptor.js';
import { TransformInterceptor } from './common/interceptors/transform/transform.interceptor.js';
import { envSchema } from './config/env.schema.js';
import { IntegrationsModule } from './integrations/integrations.module.js';
import { MaintenancesModule } from './maintenances/maintenances.module.js';
import { MechanicsModule } from './mechanics/mechanics.module.js';
import { UsersModule } from './users/users.module.js';
import { VehiclesModule } from './vehicles/vehicles.module.js';
import { WorkshopsModule } from './workshops/workshops.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validate: (config) => envSchema.parse(config),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: String(config.get('DB_SYNC')) === 'true',
      }),
    }),
    UsersModule,
    AuthModule,
    VehiclesModule,
    MechanicsModule,
    WorkshopsModule,
    MaintenancesModule,
    IntegrationsModule,
    AuditsModule,
  ],
  providers: [
    // Order matters: first authentication (JWT), then authorization (roles).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    // After Transform: it gets the raw response so it can read the id.
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
