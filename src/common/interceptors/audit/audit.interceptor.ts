import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditsService } from '../../../audits/audits.service.js';
import { AuthUser } from '../../auth-user.js';
import { AUDIT_KEY, AuditMetadata } from '../../decorators/audit.decorator.js';

/**
 * INTERCEPTOR DE AUDITORÍA.
 * En las rutas marcadas con @Audit() guarda un AuditLog (quién, qué entidad,
 * qué id, qué acción y el body enviado) SOLO si el handler terminó bien: las
 * peticiones rechazadas (400/401/403/404/409) no dejan registro.
 *
 * Se registra después del TransformInterceptor para recibir la respuesta
 * original del handler (sin envolver) y sacar de ahí el id de la entidad.
 * Si guardar la auditoría falla, se registra en el log pero no se rompe la
 * respuesta: la operación de negocio ya se confirmó.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  constructor(
    private readonly reflector: Reflector,
    private readonly auditsService: AuditsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const audit = this.reflector.get<AuditMetadata | undefined>(AUDIT_KEY, context.getHandler());
    if (!audit) return next.handle();

    const request = context.switchToHttp().getRequest();
    const user: AuthUser | undefined = request.user;

    return next.handle().pipe(
      tap((data) => {
        const entityId = Number(data?.id ?? request.params?.id) || null;
        this.auditsService
          .record({
            action: audit.action,
            entity: audit.entity,
            entityId,
            userId: user?.id ?? null,
            userEmail: user?.email ?? null,
            userRole: user?.role ?? null,
            method: request.method,
            path: request.originalUrl ?? request.url,
            details: this.sanitize(request.body),
          })
          .catch((error) => this.logger.error(`No se pudo registrar la auditoría: ${error}`));
      }),
    );
  }

  /** Nunca se guardan contraseñas en la auditoría. */
  private sanitize(body: unknown) {
    if (!body || typeof body !== 'object' || !Object.keys(body).length) return null;
    const { password: _password, ...rest } = body as Record<string, unknown>;
    return rest;
  }
}
