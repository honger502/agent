import { Controller, Post, Body, HttpCode, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { Logger } from '@nestjs/common';

@Controller('v1/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('completions')
  @HttpCode(200)
  async createChatCompletion(
    @Body() chatCompletionDto: ChatCompletionDto,
    @Headers('accept') accept: string,
    @Res() res: Response,
  ) {
    // 检查是否需要流式输出
    const useStream =
      chatCompletionDto.stream && accept === 'text/event-stream';

    if (useStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream =
        this.chatService.createChatCompletionStream(chatCompletionDto);

      stream.subscribe({
        next: (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
        error: (error) => {
          this.logger.error('Stream error:', error);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        },
        complete: () => {
          res.write('data: [DONE]\n\n');
          res.end();
        },
      });
    } else {
      // 非流式请求
      try {
        const response =
          await this.chatService.createChatCompletion(chatCompletionDto);
        res.json(response);
      } catch (error) {
        this.logger.error('API error:', error);
        res.status(500).json({ error: error.message });
      }
    }
  }
}
