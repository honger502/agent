import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatProviderFactory } from './providers/chat-provider.factory';

@Module({
  imports: [HttpModule],
  controllers: [ChatController],
  providers: [ChatService, ChatProviderFactory],
})
export class ChatModule {}
