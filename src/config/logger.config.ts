import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

const logDir = 'logs'; // 日志存储目录
const requestLogDir = path.join(logDir, 'requests');

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
if (!fs.existsSync(requestLogDir)) {
  fs.mkdirSync(requestLogDir);
}

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
  // 添加请求参数日志配置
  requestFile: {
    level: 'info',
    filename: `${logDir}/%DATE%-request.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  },
};

// 创建专门的请求日志记录器
export const createRequestLogger = (requestId: string) => {
  return winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: path.join(requestLogDir, `${requestId}.log`),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  });
};
