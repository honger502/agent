import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatCompletionDto,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from './dto/chat-completion.dto';
import { Observable } from 'rxjs';
import { ChatProviderFactory } from './providers/chat-provider.factory';

@Injectable()
export class ChatService {
  private readonly provider;

  constructor(
    private readonly configService: ConfigService,
    private readonly providerFactory: ChatProviderFactory,
  ) {
    const providerType = this.configService.get<string>('chat.provider');
    this.provider = this.providerFactory.createProvider(providerType);
  }

  async createChatCompletion(
    dto: ChatCompletionDto,
  ): Promise<ChatCompletionResponse> {
    return this.provider.createCompletion(dto);
  }

  createChatCompletionStream(
    dto: ChatCompletionDto,
  ): Observable<ChatCompletionChunk> {
    return this.provider.createCompletionStream(dto);
  }
}
