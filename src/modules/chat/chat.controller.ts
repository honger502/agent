import { Controller, Post, Body, HttpCode, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { Logger } from '@nestjs/common';
import { RequestLoggerService } from '../../shared/logger/request-logger.service';

@Controller('v1/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly requestLogger: RequestLoggerService,
  ) {}

  @Post('completions')
  @HttpCode(200)
  async createChatCompletion(
    @Body() chatCompletionDto: ChatCompletionDto,
    @Headers('accept') accept: string,
    @Res() res: Response,
  ) {
    const requestId = `req_${Date.now()}`;

    // 记录请求参数到专门的日志文件
    this.requestLogger.logRequest(requestId, chatCompletionDto);

    // 保持现有的日志记录
    this.logger.log({
      message: 'Received chat completion request',
      requestId,
      model: chatCompletionDto.model,
      messageCount: chatCompletionDto.messages.length,
      stream: chatCompletionDto.stream,
    });

    const useStream = chatCompletionDto.stream;

    if (useStream) {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';

      const stream =
        this.chatService.createChatCompletionStream(chatCompletionDto);

      stream.subscribe({
        next: (chunk) => {
          if (chunk) {
            // 累积响应内容
            if (chunk.choices?.[0]?.delta?.content) {
              fullResponse += chunk.choices[0].delta.content;
            }
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          }
        },
        error: (error) => {
          this.requestLogger.logResponse(requestId, { error: error.message });
          this.logger.error({
            message: 'Stream error occurred',
            requestId,
            error: error.message,
          });
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        },
        complete: () => {
          // 记录完整的响应
          this.requestLogger.logResponse(requestId, {
            content: fullResponse,
            model: chatCompletionDto.model,
          });
          res.write('data: [DONE]\n\n');
          res.end();
        },
      });
    } else {
      try {
        const response =
          await this.chatService.createChatCompletion(chatCompletionDto);
        this.requestLogger.logResponse(requestId, response);
        res.json(response);
      } catch (error) {
        this.requestLogger.logResponse(requestId, { error: error.message });
        this.logger.error({
          message: 'Chat completion failed',
          requestId,
          error: error.message,
        });
        res.status(500).json({ error: error.message });
      }
    }
  }
}
