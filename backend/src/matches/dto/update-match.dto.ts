import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchDto } from './create-match.dto';
import {
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { MatchOutcome } from '../../common/enums/match.enums';

export class UpdateMatchDto extends PartialType(CreateMatchDto) {
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
