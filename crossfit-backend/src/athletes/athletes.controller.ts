import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { AthletesService } from './athletes.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Post()
  create(@Body() createAthleteDto: CreateAthleteDto) {
    return this.athletesService.create(createAthleteDto);
  }

  @Get()
  findAll() {
    return this.athletesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.athletesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.athletesService.update(+id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.athletesService.remove(+id);
  }
}