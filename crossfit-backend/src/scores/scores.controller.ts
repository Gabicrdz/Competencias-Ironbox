import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  create(@Body() createScoreDto: CreateScoreDto) {
    return this.scoresService.create(createScoreDto);
  }

  // --- INICIO MODO SUSPENSO ---
  private static isLeaderboardFrozen = false;

  @Get('freeze/status')
  getFreezeStatus() {
    return { isFrozen: ScoresController.isLeaderboardFrozen };
  }

  @Post('freeze/toggle')
  toggleFreeze(@Body() body: { isFrozen: boolean }) {
    ScoresController.isLeaderboardFrozen = body.isFrozen;
    return { isFrozen: ScoresController.isLeaderboardFrozen };
  }
  // --- FIN MODO SUSPENSO ---

  @Get()
  findAll() {
    return this.scoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scoresService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scoresService.remove(+id);
  }
}