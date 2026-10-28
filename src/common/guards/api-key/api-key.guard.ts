import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * API KEY GUARD (external integrations).
 * Checks the `x-api-key` header against the list of keys in the
 * API_KEYS environment variable (separated by commas). It is used with
 * @Public() to skip the JWT check on integration endpoints.
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
