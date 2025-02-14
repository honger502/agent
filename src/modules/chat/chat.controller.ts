import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  ChatCompletionDto,
  ChatCompletionResponse,
} from './dto/chat-completion.dto';

@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('completions')
  @HttpCode(200)
  async createChatCompletion(
    @Body() chatCompletionDto: ChatCompletionDto,
  ): Promise<ChatCompletionResponse> {
    return this.chatService.createChatCompletion(chatCompletionDto);
  }
}
