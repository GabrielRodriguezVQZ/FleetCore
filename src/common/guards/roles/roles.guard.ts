import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles.decorator.js';
import { Role } from '../../enums.js';

/**
 * GLOBAL ROLES GUARD (authorization).
 * It runs after the JwtAuthGuard. It reads the roles set with @Roles()
 * and returns 403 if the logged-in user does not have any of them.
 * If the route has no roles, being logged in is enough.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta operación',
      );
    }
    return true;
  }
}
