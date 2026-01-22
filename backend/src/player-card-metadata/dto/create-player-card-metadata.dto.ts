import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, MaxLength, MinLength } from 'class-validator';
import { CardRarity } from '../entities/player-card-metadata.entity';

export class CreatePlayerCardMetadataDto {
  @IsString()
  @MinLength(1)
  playerId: string;

  @IsString()
  @MinLength(1)
  contractAddress: string;

  @IsString()
  @MinLength(1)
  tokenId: string;

  @IsString()
  @MinLength(1)
  tokenUri: string;

  @IsString()
  @MinLength(1)
  playerName: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsEnum(CardRarity)
  rarity?: CardRarity;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsNumber()
  editionNumber?: number;

  @IsOptional()
  @IsNumber()
  totalSupply?: number;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string | number>;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class UpdatePlayerCardMetadataDto {
  @IsOptional()
  @IsString()
  playerName?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsEnum(CardRarity)
  rarity?: CardRarity;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsNumber()
  editionNumber?: number;

  @IsOptional()
  @IsNumber()
  totalSupply?: number;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string | number>;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  metadata?: string;
}
