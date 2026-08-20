import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { whatsappConfig } from './config/whatsapp.config';
import { aiConfig } from './config/ai.config';
import { DbModule } from './db/db.module';
import { CacheModule } from './common/cache/cache.module';
import { AppGatewaysModule } from './modules/app.gateways.module';
import { WhatsappModule } from './modules/gateways/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env', 
      load: [whatsappConfig, aiConfig],
    }),
    DbModule,
    WhatsappModule,
    CacheModule,
    AppGatewaysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
