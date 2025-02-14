import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ChatCompletionDto,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from './dto/chat-completion.dto';
import { Observable, firstValueFrom } from 'rxjs';

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
    return new Observable((subscriber) => {
      fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ ...chatCompletionDto, stream: true }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                subscriber.complete();
                break;
              }

              const chunk = decoder.decode(value);
              const lines = chunk
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.startsWith('data: '));

              for (const line of lines) {
                if (line === 'data: [DONE]') {
                  continue;
                }
                const json = JSON.parse(line.slice(6));
                subscriber.next(json);
              }
            }
          } catch (error) {
            subscriber.error(error);
          }
        })
        .catch((error) => {
          subscriber.error(error);
        });

      // 返回清理函数
      return () => {
        // 清理工作
      };
    });
  }
}
