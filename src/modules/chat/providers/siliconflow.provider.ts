import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, firstValueFrom } from 'rxjs';
import { ChatProvider } from './chat-provider.interface';
import {
  ChatCompletionDto,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from '../dto/chat-completion.dto';

@Injectable()
export class SiliconflowProvider implements ChatProvider {
  private readonly logger = new Logger(SiliconflowProvider.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  async createCompletion(
    dto: ChatCompletionDto,
  ): Promise<ChatCompletionResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<ChatCompletionResponse>(this.apiUrl, dto, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return data;
    } catch (error) {
      this.logger.error('Error calling Siliconflow API:', error);
      throw error;
    }
  }

  createCompletionStream(
    dto: ChatCompletionDto,
  ): Observable<ChatCompletionChunk> {
    return new Observable((subscriber) => {
      fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ ...dto, stream: true }),
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

      return () => {
        // 清理工作
      };
    });
  }
}
