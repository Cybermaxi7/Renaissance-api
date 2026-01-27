import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ReconciliationReport } from './entities/reconciliation-report.entity';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationScheduler } from './reconciliation.scheduler';
import { ReconciliationController } from './reconciliation.controller';
import { User } from '../users/entities/user.entity';
import { Bet } from '../bets/entities/bet.entity';
import { Match } from '../matches/entities/match.entity';
import { Settlement } from '../blockchain/entities/settlement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReconciliationReport,
      User,
      Bet,
      Match,
      Settlement,
    ]),
    ConfigModule,
  ],
  controllers: [ReconciliationController],
  providers: [ReconciliationService, ReconciliationScheduler],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
