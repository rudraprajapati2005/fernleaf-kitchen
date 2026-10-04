import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      res.status(status).json(typeof body === 'string' ? { statusCode: status, message: body } : body);
      return;
    }
    const message = exception instanceof Error ? exception.message : 'Unexpected error';
    this.log.error(message, exception instanceof Error ? exception.stack : undefined);
    const isBiz =
      /must|cannot|invalid|required|not allowed|at most|add up|cut-off|cutoff|tier|invoice|driver|twice|holiday|domain/i.test(
        message,
      );
    res.status(isBiz ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: isBiz ? 400 : 500,
      error: isBiz ? 'BusinessRule' : 'InternalServerError',
      message: isBiz ? message : 'Something went wrong',
    });
  }
}
