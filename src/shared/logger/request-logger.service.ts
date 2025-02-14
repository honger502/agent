import { Injectable } from '@nestjs/common';
import { createRequestLogger } from '../../config/logger.config';
import * as winston from 'winston';

@Injectable()
export class RequestLoggerService {
  private loggers: Map<string, winston.Logger> = new Map();

  logRequest(requestId: string, request: any) {
    if (!this.loggers.has(requestId)) {
      this.loggers.set(requestId, createRequestLogger(requestId));
    }

    const logger = this.loggers.get(requestId);
    logger.info({ request });
  }
}
