import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(private prisma: PrismaService) {}

  create(createScoreDto: CreateScoreDto) {
    return this.prisma.score.create({
      data: {
        position: createScoreDto.position,
        points: createScoreDto.points,
        observations: createScoreDto.observations,
        athleteId: createScoreDto.athleteId,
        wodId: createScoreDto.wodId,
      },
    });
  }

  findAll() {
    return this.prisma.score.findMany({
      // Al listar puntuaciones, traemos los datos del atleta y del WOD para saber a quién pertenece
      include: { athlete: true, wod: true }, 
    });
  }

  findOne(id: number) {
    return this.prisma.score.findUnique({
      where: { id },
      include: { athlete: true, wod: true },
    });
  }
}