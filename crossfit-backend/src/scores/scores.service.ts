import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(private prisma: PrismaService) {}

  async create(createScoreDto: CreateScoreDto) {
    // 1. Guardamos el resultado crudo
    const newScore = await this.prisma.score.create({ data: createScoreDto });

    // 2. Mandamos a recalcular la tabla
    await this.recalculateRankings(createScoreDto.wodId);

    return newScore;
  }

  findAll() {
    return this.prisma.score.findMany({
      include: { athlete: true, wod: true }
    });
  }

  findOne(id: number) {
    return this.prisma.score.findUnique({
      where: { id },
      include: { athlete: true, wod: true }
    });
  }

  async remove(id: number) {
    const score = await this.prisma.score.findUnique({ where: { id } });
    if (!score) return;

    await this.prisma.score.delete({ where: { id } });
    await this.recalculateRankings(score.wodId);
    return score;
  }

  // 🔥 EL CEREBRO DE LA COMPETENCIA (AHORA CON SISTEMA DE EMPATES) 🔥
  private async recalculateRankings(wodId: number) {
    const wod = await this.prisma.wod.findUnique({ where: { id: wodId } });
    if (!wod) return;

    const scores = await this.prisma.score.findMany({ where: { wodId } });

    // 1. Los ordenamos matemáticamente
    scores.sort((a, b) => {
      if (wod.type === 'TIME') {
        return a.resultValue - b.resultValue; 
      } else {
        return b.resultValue - a.resultValue; 
      }
    });

    const topPoints = [100, 95, 90, 85, 80]; 
    
    // Variables para recordar cómo le fue al atleta anterior
    let currentRank = 1;
    let currentPoints = 100;
    let previousResult: number | null = null;

    for (let i = 0; i < scores.length; i++) {
      // 2. Comparamos: Si es el primer atleta de la lista, o si hizo un resultado DIFERENTE al anterior...
      if (i === 0 || scores[i].resultValue !== previousResult) {
        // ...le asignamos su puesto real basado en su lugar en la lista (Ej: i=2 significa 3er puesto)
        currentRank = i + 1; 
        currentPoints = currentRank <= 5 ? topPoints[currentRank - 1] : Math.max(0, 80 - (currentRank - 5));
      }
      // Si el resultado es IGUAL al anterior, el 'if' se salta y el atleta hereda exactamente el mismo Rank y Points.

      // Guardamos el resultado de este atleta para compararlo con el siguiente
      previousResult = scores[i].resultValue;

      // 3. Guardamos la nueva posición y puntaje en la base de datos
      await this.prisma.score.update({
        where: { id: scores[i].id },
        data: { position: currentRank, points: currentPoints }
      });
    }
  }
}