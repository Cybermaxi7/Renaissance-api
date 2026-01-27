import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { MatchOutcome } from '../../common/enums/match.enums';

export class CreatePredictionDto {
  @IsNotEmpty()
  @IsUUID()
  matchId: string;

  @IsNotEmpty()
  @IsEnum(MatchOutcome)
  predictedOutcome: MatchOutcome;
}
