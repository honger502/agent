import { Controller, Post, Body, HttpCode, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatCompletionDto } from './dto/chat-completion.dto';

@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('completions')
  @HttpCode(200)
  async createChatCompletion(
    @Body() chatCompletionDto: ChatCompletionDto,
    @Headers('accept') accept: string,
    @Res() res: Response,
  ) {
    if (accept === 'text/event-stream') {
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
          console.error('Stream error:', error);
          res.end();
        },
        complete: () => {
          res.write('data: [DONE]\n\n');
          res.end();
        },
      });
    } else {
      res.json({ error: 'Streaming is required for this endpoint' });
    }
  }
}
