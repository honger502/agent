import { Injectable } from '@nestjs/common';
import { createRequestLogger } from '../../config/logger.config';

@Injectable()
export class RequestLoggerService {
  private logger = createRequestLogger();

  logRequest(requestId: string, request: any) {
    this.logger.info('request', {
      requestId,
      request,
    });
  }
}
