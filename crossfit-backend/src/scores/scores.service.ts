import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(private prisma: PrismaService) {}

  async create(createScoreDto: CreateScoreDto) {
    // 1. Guardamos el resultado crudo que envió el juez
    const newScore = await this.prisma.score.create({ data: createScoreDto });

    // 2. Mandamos a recalcular toda la tabla de ese WOD
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

    // Borramos el registro
    await this.prisma.score.delete({ where: { id } });

    // Recalculamos la tabla porque alguien salió de la lista
    await this.recalculateRankings(score.wodId);
    return score;
  }

  // 🔥 EL CEREBRO DE LA COMPETENCIA 🔥
  private async recalculateRankings(wodId: number) {
    // 1. Buscamos de qué tipo es el WOD (Tiempo, Peso o Reps)
    const wod = await this.prisma.wod.findUnique({ where: { id: wodId } });
    if (!wod) return;

    // 2. Traemos todas las puntuaciones de los atletas en ese WOD
    const scores = await this.prisma.score.findMany({ where: { wodId } });

    // 3. Los ordenamos automáticamente
    scores.sort((a, b) => {
      if (wod.type === 'TIME') {
        return a.resultValue - b.resultValue; // Si es tiempo, el menor número gana
      } else {
        return b.resultValue - a.resultValue; // Si es peso/reps, el mayor número gana
      }
    });

    // 4. Repartimos los puntos y posiciones
    const topPoints = [100, 95, 90, 85, 80]; // Puntos para el Top 5

    for (let i = 0; i < scores.length; i++) {
      const position = i + 1;
      // Si está en el Top 5 le da los puntos fuertes, si no, va restando de a 1 punto.
      const points = position <= 5 ? topPoints[i] : Math.max(0, 80 - (position - 5));

      // 5. Actualizamos el registro del atleta con su nueva medalla y puntos
      await this.prisma.score.update({
        where: { id: scores[i].id },
        data: { position, points }
      });
    }
  }
}