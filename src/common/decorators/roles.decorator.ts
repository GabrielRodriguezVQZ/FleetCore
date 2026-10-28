import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums.js';

export const ROLES_KEY = 'roles';

/** Sets the roles that can use the route. The RolesGuard checks it. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
