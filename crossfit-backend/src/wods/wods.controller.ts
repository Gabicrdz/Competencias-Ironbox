import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { WodsService } from './wods.service';
import { CreateWodDto } from './dto/create-wod.dto';

@Controller('wods')
export class WodsController {
  constructor(private readonly wodsService: WodsService) {}

  @Post()
  create(@Body() createWodDto: CreateWodDto) {
    return this.wodsService.create(createWodDto);
  }

  @Get()
  findAll() {
    return this.wodsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wodsService.findOne(+id);
  }

// NUEVA RUTA PARA RECIBIR LA EDICIÓN
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.wodsService.update(+id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wodsService.remove(+id);
  }
}