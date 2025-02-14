import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import configuration from './config/configuration';
import { LoggerModule } from './shared/logger/logger.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'stg', 'production')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
    }),
    LoggerModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
