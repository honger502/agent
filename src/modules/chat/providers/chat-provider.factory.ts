import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ChatProvider } from './chat-provider.interface';
import { SiliconflowProvider } from './siliconflow.provider';
import { DeepseekProvider } from './deepseek.provider';

@Injectable()
export class ChatProviderFactory {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  createProvider(type: string): ChatProvider {
    switch (type.toLowerCase()) {
      case 'siliconflow':
        return new SiliconflowProvider(
          this.httpService,
          this.configService.get<string>('siliconflow.apiUrl'),
          this.configService.get<string>('siliconflow.apiKey'),
        );
      case 'deepseek':
        return new DeepseekProvider(
          this.httpService,
          this.configService.get<string>('deepseek.apiUrl'),
          this.configService.get<string>('deepseek.apiKey'),
        );
      // 可以添加其他提供商
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }
}
