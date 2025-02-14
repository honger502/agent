import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 关闭 Nest 默认日志
    logger: false,
  });

  const configService = app.get(ConfigService);

  // 使用 Winston 日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = configService.get<number>('port');
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
