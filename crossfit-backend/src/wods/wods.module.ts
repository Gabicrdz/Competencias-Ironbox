import { Module } from '@nestjs/common';
import { WodsService } from './wods.service';
import { WodsController } from './wods.controller';

@Module({
  controllers: [WodsController],
  providers: [WodsService],
})
export class WodsModule {}
