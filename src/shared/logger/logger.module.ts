import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { loggerConfig } from '../../config/logger.config';
import { RequestLoggerService } from './request-logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const transports: winston.transport[] = [];
        const loggerOptions = configService.get('logger');

        // 根据环境配置添加日志传输方式
        if (loggerOptions.console) {
          transports.push(new winston.transports.Console(loggerConfig.console));
        }

        if (loggerOptions.file) {
          transports.push(
            new winston.transports.DailyRotateFile(
              loggerConfig.dailyRotateFile,
            ),
            new winston.transports.DailyRotateFile(loggerConfig.errorFile),
          );
        }

        return {
          transports,
        };
      },
    }),
  ],
  providers: [RequestLoggerService],
  exports: [RequestLoggerService],
})
export class LoggerModule {}
