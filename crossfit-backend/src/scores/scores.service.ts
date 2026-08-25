import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(private prisma: PrismaService) {}

  async create(createScoreDto: CreateScoreDto) {
    const newScore = await this.prisma.score.create({ data: createScoreDto });
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

  // 🔥 EL CEREBRO DE LA COMPETENCIA (AHORA SEPARA POR GÉNERO Y EMPATES) 🔥
  private async recalculateRankings(wodId: number) {
    const wod = await this.prisma.wod.findUnique({ where: { id: wodId } });
    if (!wod) return;

    // 1. Traemos todos los puntajes INCLUYENDO los datos del atleta para saber su género
    const allScores = await this.prisma.score.findMany({ 
      where: { wodId },
      include: { athlete: true } 
    });

    // 2. Definimos los géneros a evaluar
    const genders = ['MASCULINO', 'FEMENINO'];

    // 3. Procesamos cada género por separado
    for (const gender of genders) {
      // Filtramos solo los puntajes de este género en específico
      const scores = allScores.filter(s => (s.athlete as any)?.gender === gender);
      
      if (scores.length === 0) continue; // Si no hay atletas de este género, saltamos

      // 4. Los ordenamos matemáticamente (Menor a mayor si es Tiempo, Mayor a menor si es Reps/Peso)
      scores.sort((a, b) => {
        if (wod.type === 'TIME') {
          return a.resultValue - b.resultValue; 
        } else {
          return b.resultValue - a.resultValue; 
        }
      });

      const topPoints = [100, 95, 90, 85, 80]; 
      
      let currentRank = 1;
      let currentPoints = 100;
      let previousResult: number | null = null;

      // 5. Repartimos posiciones y puntos para este género
      for (let i = 0; i < scores.length; i++) {
        if (i === 0 || scores[i].resultValue !== previousResult) {
          currentRank = i + 1; 
          currentPoints = currentRank <= 5 ? topPoints[currentRank - 1] : Math.max(0, 80 - (currentRank - 5));
        }

        previousResult = scores[i].resultValue;

        // 6. Guardamos en la base de datos
        await this.prisma.score.update({
          where: { id: scores[i].id },
          data: { position: currentRank, points: currentPoints }
        });
      }
    }
  }
}