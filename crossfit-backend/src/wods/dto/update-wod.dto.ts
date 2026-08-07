import { PartialType } from '@nestjs/mapped-types';
import { CreateWodDto } from './create-wod.dto';

export class UpdateWodDto extends PartialType(CreateWodDto) {}
