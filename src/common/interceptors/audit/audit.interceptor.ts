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
 * AUDIT INTERCEPTOR.
 * On routes marked with @Audit() it saves an AuditLog (who, which entity,
 * which id, which action and the request body) ONLY if the handler worked:
 * rejected requests (400/401/403/404/409) are not saved.
 *
 * It is registered after the TransformInterceptor so it gets the original
 * handler response (not wrapped) and can read the entity id from it.
 * If saving the audit fails, the error goes to the log but the response
 * still works: the business operation is already saved.
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

  /** Passwords are never saved in the audit log. */
  private sanitize(body: unknown) {
    if (!body || typeof body !== 'object' || !Object.keys(body).length) return null;
    const { password: _password, ...rest } = body as Record<string, unknown>;
    return rest;
  }
}
