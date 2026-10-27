import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * GUARD DE API KEY (integraciones externas).
 * Valida el header `x-api-key` contra la lista de claves definida en la
 * variable de entorno API_KEYS (separadas por coma). Se usa junto con
 * @Public() para saltar el JWT en los endpoints de integración.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validKeys: string[];

  constructor(config: ConfigService) {
    this.validKeys = String(config.get('API_KEYS') ?? '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (typeof apiKey !== 'string' || !this.validKeys.includes(apiKey)) {
      throw new UnauthorizedException('API Key inválida o no proporcionada');
    }
    return true;
  }
}
