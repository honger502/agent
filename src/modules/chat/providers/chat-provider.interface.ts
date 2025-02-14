import {
  ChatCompletionDto,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from '../dto/chat-completion.dto';
import { Observable } from 'rxjs';

export interface ChatProvider {
  createCompletion(dto: ChatCompletionDto): Promise<ChatCompletionResponse>;
  createCompletionStream(
    dto: ChatCompletionDto,
  ): Observable<ChatCompletionChunk>;
}
