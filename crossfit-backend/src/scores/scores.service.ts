import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(private prisma: PrismaService) {}

  create(createScoreDto: CreateScoreDto) {
    return this.prisma.score.create({ data: createScoreDto });
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

  remove(id: number) {
    return this.prisma.score.delete({ where: { id } });
  }
}