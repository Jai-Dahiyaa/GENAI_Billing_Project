import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class AiChatQueryDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  sessionId: string
}