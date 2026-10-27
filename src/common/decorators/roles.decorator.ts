import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums.js';

export const ROLES_KEY = 'roles';

/** Declara los roles que pueden ejecutar la ruta. Lo valida el RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
