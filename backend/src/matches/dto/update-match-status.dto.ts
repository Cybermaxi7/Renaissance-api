import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { MatchStatus, MatchOutcome } from '../../common/enums/match.enums';

export class UpdateMatchStatusDto {
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Home score cannot be negative' })
  homeScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Away score cannot be negative' })
  awayScore?: number;

  @IsOptional()
  @IsEnum(MatchOutcome)
  outcome?: MatchOutcome;
}
