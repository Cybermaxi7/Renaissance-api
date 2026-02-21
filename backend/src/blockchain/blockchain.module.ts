import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SorobanService } from './soroban.service';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { Settlement } from './entities/settlement.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Settlement])],
  controllers: [SettlementController],
  providers: [SorobanService, SettlementService],
  exports: [SettlementService, SorobanService],
})
export class BlockchainModule {}
