import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/** Registra método, ruta y duración de cada petición. */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { method, url } = context.switchToHttp().getRequest();
    const start = Date.now();
    return next
      .handle()
      .pipe(tap(() => this.logger.log(`${method} ${url} - ${Date.now() - start}ms`)));
  }
}
