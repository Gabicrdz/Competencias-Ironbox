export class CreateAthleteDto {
  fullName!: string;
  boxName?: string; // El signo de interrogación significa que es opcional
  categoryId!: number;
}