import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logDir = 'logs'; // 日志存储目录

export const loggerConfig = {
  // 控制台输出
  console: {
    level: 'debug',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('APP', {
        prettyPrint: true,
        colors: true,
      }),
    ),
  },
  // 日常日志文件
  dailyRotateFile: {
    level: 'info',
    filename: `${logDir}/%DATE%-app.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  },
  // 错误日志文件
  errorFile: {
    level: 'error',
    filename: `${logDir}/%DATE%-error.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  },
};
