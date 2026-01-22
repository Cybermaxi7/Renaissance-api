import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerCardMetadata } from './entities/player-card-metadata.entity';
import { PlayerCardMetadataService } from './player-card-metadata.service';
import { PlayerCardMetadataController } from './player-card-metadata.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerCardMetadata])],
  providers: [PlayerCardMetadataService],
  controllers: [PlayerCardMetadataController],
  exports: [PlayerCardMetadataService],
})
export class PlayerCardMetadataModule {}
