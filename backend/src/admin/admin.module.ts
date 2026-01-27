import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { Bet } from '../bets/entities/bet.entity';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminAuditLog,
      Bet,
      User,
      Match,
      Transaction,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
