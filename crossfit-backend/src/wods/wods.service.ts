import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWodDto } from './dto/create-wod.dto';

@Injectable()
export class WodsService {
  constructor(private prisma: PrismaService) {}

  create(createWodDto: CreateWodDto) {
    return this.prisma.wod.create({
      data: {
        name: createWodDto.name,
        description: createWodDto.description,
        categoryId: createWodDto.categoryId,
      },
    });
  }

  findAll() {
    return this.prisma.wod.findMany({
      include: { category: true }, // Traemos los datos de la categoría asignada
    });
  }

  findOne(id: number) {
    return this.prisma.wod.findUnique({
      where: { id },
      include: { category: true },
    });
  }
}