export class CreateScoreDto {
  position!: number;
  points!: number;
  observations?: string; // Opcional (para empates o penalizaciones)
  athleteId!: number;
  wodId!: number;
}