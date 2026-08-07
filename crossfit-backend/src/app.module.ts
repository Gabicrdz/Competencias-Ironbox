import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AthletesModule } from './athletes/athletes.module';
import { PrismaModule } from './prisma/prisma.module';
import { WodsModule } from './wods/wods.module';
import { ScoresModule } from './scores/scores.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [AthletesModule, PrismaModule, WodsModule, ScoresModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
