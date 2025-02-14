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
    const requestId = `req_${Date.now()}`;
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

      const stream =
        this.chatService.createChatCompletionStream(chatCompletionDto);

      stream.subscribe({
        next: (chunk) => {
          if (chunk) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          }
        },
        error: (error) => {
          this.logger.error({
            message: 'Stream error occurred',
            requestId,
            error: error.message,
          });
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        },
        complete: () => {
          res.write('data: [DONE]\n\n');
          res.end();
        },
      });
    } else {
      try {
        const response =
          await this.chatService.createChatCompletion(chatCompletionDto);
        res.json(response);
      } catch (error) {
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
