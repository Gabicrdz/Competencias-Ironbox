export class CreateScoreDto {
  athleteId!: number;
  wodId!: number;
  resultValue!: number;
  resultString!: string;
  observations?: string;
}