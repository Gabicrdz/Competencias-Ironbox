export class CreateAthleteDto {
  fullName!: string;
  boxName?: string;
  gender!: string; // <--- ESTA LÍNEA ES NUEVA
  categoryId!: number;
}