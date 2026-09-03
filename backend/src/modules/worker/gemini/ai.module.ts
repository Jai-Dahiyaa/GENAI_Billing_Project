import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiWorkerController } from './ai.controller';
import { AiWorkerService } from './ai.service';
import { LangChainAiService } from './langchain.service';
import { VectorService } from './vector.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiWorkerController],
  providers: [AiWorkerService, LangChainAiService, VectorService],
  exports: [AiWorkerService, LangChainAiService, VectorService],
})
export class AiWorkerModule {}