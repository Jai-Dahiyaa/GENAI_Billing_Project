import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiChatQueryDto } from './dto/ai-chat.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { IAuthorizedRequest } from '../../../common/interfaces/request.interface';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService
  ) { }

  // @Public()
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Body() dto: AiChatQueryDto,
    @Req() req: IAuthorizedRequest
  ) {
    const {userId, role} = req.user;

    const reply = await this.aiService.generateChatReply(
      userId,
      role,
      dto.message, 
      dto.sessionId
    );

    return {
      success: true,
      data: { reply },
    };
  }
}