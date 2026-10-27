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
 * GUARD GLOBAL DE AUTORIZACIÓN POR ROLES.
 * Se ejecuta después del JwtAuthGuard. Lee los roles declarados con @Roles()
 * y responde 403 si el usuario autenticado no tiene ninguno de ellos.
 * Si la ruta no declara roles, basta con estar autenticado.
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
