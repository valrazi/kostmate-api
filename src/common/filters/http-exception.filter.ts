import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    this.logger.error(`Request failed: ${request.method} ${request.url}`, exception as Error);

    response.status(status).json({
      success: false,
      message: typeof payload === 'string' ? payload : 'Request failed',
      data: null,
      meta: {
        path: request.url,
        timestamp: new Date().toISOString(),
        error: typeof payload === 'object' ? payload : undefined,
      },
    });
  }
}
