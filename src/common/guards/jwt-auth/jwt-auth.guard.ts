import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator.js';
import { AuthUser } from '../../auth-user.js';

/**
 * GUARD GLOBAL DE AUTENTICACIÓN.
 * Todas las rutas exigen un JWT válido (Authorization: Bearer <token>),
 * salvo las marcadas con @Public(). Falla con 401 si no hay token,
 * es inválido o expiró. Al validar, adjunta el usuario a request.user.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const [type, token] = (request.headers.authorization ?? '').split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token de autenticación no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user: AuthUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
