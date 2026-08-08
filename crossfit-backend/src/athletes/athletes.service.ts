import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';

@Injectable()
export class AthletesService {
  constructor(private prisma: PrismaService) {}

  create(createAthleteDto: CreateAthleteDto) {
    return this.prisma.athlete.create({ data: createAthleteDto });
  }

  findAll() {
    return this.prisma.athlete.findMany({ include: { category: true } });
  }

  findOne(id: number) {
    return this.prisma.athlete.findUnique({ where: { id }, include: { category: true } });
  }

  async remove(id: number) {
    // Borrar primero los puntajes asociados para evitar errores
    await this.prisma.score.deleteMany({ where: { athleteId: id } });
    return this.prisma.athlete.delete({ where: { id } });
  }
}