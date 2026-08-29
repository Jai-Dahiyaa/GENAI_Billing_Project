import { Global, Module } from '@nestjs/common';
import { CacheManagerService } from './cache-manager.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [CacheManagerService, CacheService],
  exports: [CacheService, CacheManagerService],
})
export class CacheModule {}