import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prismaDB';
import { DirectDbService } from './db';
import { VectorStoreProvider, PG_VECTOR_STORE } from './vector-store.provider';

@Global()
@Module({
  providers: [PrismaService, DirectDbService, VectorStoreProvider],
  exports: [PrismaService, DirectDbService, VectorStoreProvider, PG_VECTOR_STORE],
})
export class DbModule {}