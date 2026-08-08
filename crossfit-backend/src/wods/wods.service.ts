import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWodDto } from './dto/create-wod.dto';

@Injectable()
export class WodsService {
  constructor(private prisma: PrismaService) {}

  create(createWodDto: CreateWodDto) {
    return this.prisma.wod.create({ data: createWodDto });
  }

  findAll() {
    return this.prisma.wod.findMany({ include: { category: true } });
  }

  findOne(id: number) {
    return this.prisma.wod.findUnique({ where: { id }, include: { category: true } });
  }

  async remove(id: number) {
    // Borrar primero los puntajes asociados para evitar errores
    await this.prisma.score.deleteMany({ where: { wodId: id } });
    return this.prisma.wod.delete({ where: { id } });
  }
}