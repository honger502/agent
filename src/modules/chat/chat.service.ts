import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ChatCompletionDto,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from './dto/chat-completion.dto';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('siliconflow.apiUrl');
    this.apiKey = this.configService.get<string>('siliconflow.apiKey');
  }

  async createChatCompletion(
    chatCompletionDto: ChatCompletionDto,
  ): Promise<ChatCompletionResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<ChatCompletionResponse>(
          this.apiUrl,
          chatCompletionDto,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return data;
    } catch (error) {
      this.logger.error('Error calling Siliconflow API:', error);
      throw error;
    }
  }

  createChatCompletionStream(
    chatCompletionDto: ChatCompletionDto,
  ): Observable<ChatCompletionChunk> {
    return this.httpService
      .post<string>(
        this.apiUrl,
        { ...chatCompletionDto, stream: true },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(
        map((response) => {
          const dataStr = response.data as string;

          // 处理 [DONE] 消息
          if (dataStr.includes('data: [DONE]')) {
            return null;
          }

          // 提取并解析 JSON 数据
          const match = dataStr.match(/^data: ({.*})/);
          if (!match) {
            return null;
          }

          return JSON.parse(match[1]) as ChatCompletionChunk;
        }),
      );
  }
}
