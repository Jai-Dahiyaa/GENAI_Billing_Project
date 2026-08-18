import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { winstonLogger } from '../../config/logger.config';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      errorMessage = typeof res === 'object' && res !== null ? (res as any).message || res : res;
    } 
   
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case '23505': 
        case 'P2002':
          status = HttpStatus.CONFLICT;
          errorMessage = 'Record with this unique value already exists.';
          break;
        case '23502': 
        case 'P2003': 
          status = HttpStatus.BAD_REQUEST;
          errorMessage = 'Invalid payload or foreign key constraint failed.';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          errorMessage = 'Requested record not found.';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          errorMessage = 'Database operation failed.';
          break;
      }
    }

    if (Array.isArray(errorMessage)) {
      errorMessage = errorMessage.join(', ');
    }

    const errorResponse = {
      statusCode: status,
      success: false,
      message: errorMessage,
      data: null,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    const isDev = process.env.NODE_ENV !== 'production';
    const stackTrace = exception instanceof Error ? exception.stack : null;

    if (isDev && stackTrace) {
      winstonLogger.error(
        `HTTP Error ${status} [${request.method}] ${request.url} - ${JSON.stringify(errorMessage)}\nStack: ${stackTrace}`,
      );
    } else {
      winstonLogger.error(
        `HTTP Error ${status} [${request.method}] ${request.url} - ${JSON.stringify(errorMessage)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}