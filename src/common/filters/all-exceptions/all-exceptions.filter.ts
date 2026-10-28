import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

/**
 * GLOBAL EXCEPTION FILTER.
 * Every error is returned with the same format:
 * { success:false, statusCode, message, path, timestamp }
 * - HttpException (validation, auth, roles, business) keeps its code.
 * - PostgreSQL errors (unique, FK, etc.) are changed to 409/400
 *   so they NEVER come back as a 500.
 * - Only truly unexpected errors return 500 (and are written to the log).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const raw = (body as any).message ?? exception.message;
        message = Array.isArray(raw) ? raw.join('; ') : raw;
      }
    } else if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Recurso no encontrado';
    } else if (exception instanceof QueryFailedError) {
      const code = (exception as any).driverError?.code ?? (exception as any).code;
      const mapped = this.mapPostgresError(code);
      if (mapped) ({ statusCode, message } = mapped);
    }

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapPostgresError(code?: string) {
    switch (code) {
      case '23505': // unique_violation
        return { statusCode: HttpStatus.CONFLICT, message: 'Ya existe un registro con ese valor único (placa, correo, etc.)' };
      case '23503': // foreign_key_violation
        return { statusCode: HttpStatus.CONFLICT, message: 'La operación viola una relación con otro registro' };
      case '23502': // not_null_violation
      case '22P02': // invalid_text_representation
      case '22001': // string_data_right_truncation
      case '22003': // numeric_value_out_of_range
        return { statusCode: HttpStatus.BAD_REQUEST, message: 'Datos inválidos para la operación solicitada' };
      default:
        return null;
    }
  }
}
