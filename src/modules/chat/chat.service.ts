import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ChatCompletionDto,
  ChatCompletionResponse,
} from './dto/chat-completion.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('SILICONFLOW_API_URL');
    this.apiKey = this.configService.get<string>('SILICONFLOW_API_KEY');
  }

  async createChatCompletion(
    chatCompletionDto: ChatCompletionDto,
  ): Promise<ChatCompletionResponse> {
    try {
      // 转换为 Siliconflow 的请求格式
      const siliconflowRequest =
        this.transformToSiliconflowRequest(chatCompletionDto);

      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, siliconflowRequest, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      // 转换为 OpenAI 的响应格式
      return this.transformToOpenAIResponse(response.data);
    } catch (error) {
      this.logger.error('Error calling Siliconflow API:', error);
      throw error;
    }
  }

  private transformToSiliconflowRequest(dto: ChatCompletionDto) {
    // 根据 Siliconflow 的 API 格式进行转换
    return {
      messages: dto.messages,
      temperature: dto.temperature,
      // 其他参数映射...
    };
  }

  private transformToOpenAIResponse(
    siliconflowResponse: any,
  ): ChatCompletionResponse {
    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: siliconflowResponse.model || 'siliconflow-default',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: siliconflowResponse.content,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: siliconflowResponse.usage?.prompt_tokens || 0,
        completion_tokens: siliconflowResponse.usage?.completion_tokens || 0,
        total_tokens: siliconflowResponse.usage?.total_tokens || 0,
      },
    };
  }
}
