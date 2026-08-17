import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prismaDB';
import { DirectDbService } from './db';

@Global()
@Module({
  providers: [PrismaService, DirectDbService],
  exports: [PrismaService, DirectDbService],
})
export class DbModule {}