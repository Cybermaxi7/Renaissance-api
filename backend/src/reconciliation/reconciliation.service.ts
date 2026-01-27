import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import {
  ReconciliationReport,
  ReportStatus,
  ReportType,
  InconsistencyType,
  Severity,
  Inconsistency,
} from './entities/reconciliation-report.entity';
import { User } from '../users/entities/user.entity';
import { Bet, BetStatus } from '../bets/entities/bet.entity';
import { Match, MatchStatus } from '../matches/entities/match.entity';
import { Settlement, SettlementStatus } from '../blockchain/entities/settlement.entity';

export interface PaginatedReports {
  data: ReconciliationReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportSummary {
  latestReport: ReconciliationReport | null;
  totalReportsToday: number;
  totalInconsistenciesToday: number;
  criticalIssuesCount: number;
  lastRunAt: Date | null;
}

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);
  private readonly STUCK_SETTLEMENT_THRESHOLD_HOURS = 24;

  constructor(
    @InjectRepository(ReconciliationReport)
    private readonly reportRepository: Repository<ReconciliationReport>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
  ) {}

  /**
   * Detect users with negative wallet balances
   * Severity: CRITICAL - should never happen in normal operations
   */
  async detectNegativeBalances(): Promise<Inconsistency[]> {
    this.logger.log('Detecting negative balances...');

    const usersWithNegativeBalance = await this.userRepository
      .createQueryBuilder('user')
      .where('user.wallet_balance < 0')
      .getMany();

    const inconsistencies: Inconsistency[] = usersWithNegativeBalance.map(
      (user) => ({
        type: InconsistencyType.NEGATIVE_BALANCE,
        severity: Severity.CRITICAL,
        entityType: 'User',
        entityId: user.id,
        description: `User ${user.email} has negative wallet balance: ${user.walletBalance}`,
        details: {
          userId: user.id,
          email: user.email,
          walletBalance: user.walletBalance,
        },
        detectedAt: new Date(),
      }),
    );

    this.logger.log(
      `Found ${inconsistencies.length} users with negative balances`,
    );
    return inconsistencies;
  }

  /**
   * Detect orphaned bets - PENDING bets for FINISHED or CANCELLED matches
   * Severity: HIGH - indicates settlement process failure
   */
  async detectOrphanedBets(): Promise<Inconsistency[]> {
    this.logger.log('Detecting orphaned bets...');

    const orphanedBets = await this.betRepository
      .createQueryBuilder('bet')
      .leftJoinAndSelect('bet.match', 'match')
      .leftJoinAndSelect('bet.user', 'user')
      .where('bet.status = :betStatus', { betStatus: BetStatus.PENDING })
      .andWhere('match.status IN (:...matchStatuses)', {
        matchStatuses: [MatchStatus.FINISHED, MatchStatus.CANCELLED],
      })
      .getMany();

    const inconsistencies: Inconsistency[] = orphanedBets.map((bet) => ({
      type: InconsistencyType.ORPHANED_BET,
      severity: Severity.HIGH,
      entityType: 'Bet',
      entityId: bet.id,
      description: `Bet ${bet.id} is PENDING but match ${bet.matchId} is ${bet.match?.status}`,
      details: {
        betId: bet.id,
        userId: bet.userId,
        userEmail: bet.user?.email,
        matchId: bet.matchId,
        matchStatus: bet.match?.status,
        matchOutcome: bet.match?.outcome,
        stakeAmount: bet.stakeAmount,
        predictedOutcome: bet.predictedOutcome,
        createdAt: bet.createdAt,
      },
      detectedAt: new Date(),
    }));

    this.logger.log(`Found ${inconsistencies.length} orphaned bets`);
    return inconsistencies;
  }

  /**
   * Detect mismatched settlements - settlement outcome doesn't match bet status
   * Severity: HIGH - indicates settlement logic errors
   */
  async detectMismatchedSettlements(): Promise<Inconsistency[]> {
    this.logger.log('Detecting mismatched settlements...');

    const settlements = await this.settlementRepository.find({
      where: { status: SettlementStatus.CONFIRMED },
    });

    const inconsistencies: Inconsistency[] = [];

    for (const settlement of settlements) {
      const bet = await this.betRepository.findOne({
        where: { id: settlement.betId },
        relations: ['match'],
      });

      if (!bet) {
        inconsistencies.push({
          type: InconsistencyType.MISMATCHED_SETTLEMENT,
          severity: Severity.HIGH,
          entityType: 'Settlement',
          entityId: settlement.id,
          description: `Settlement ${settlement.id} references non-existent bet ${settlement.betId}`,
          details: {
            settlementId: settlement.id,
            betId: settlement.betId,
            settlementOutcome: settlement.outcome,
            settlementAmount: settlement.amount,
          },
          detectedAt: new Date(),
        });
        continue;
      }

      // Check if settlement outcome matches bet status
      const expectedBetStatus = this.getExpectedBetStatus(
        settlement.outcome,
        bet.predictedOutcome,
        bet.match?.outcome,
      );

      if (expectedBetStatus && bet.status !== expectedBetStatus) {
        inconsistencies.push({
          type: InconsistencyType.MISMATCHED_SETTLEMENT,
          severity: Severity.HIGH,
          entityType: 'Settlement',
          entityId: settlement.id,
          description: `Settlement ${settlement.id} outcome (${settlement.outcome}) doesn't match bet status (${bet.status}), expected ${expectedBetStatus}`,
          details: {
            settlementId: settlement.id,
            betId: bet.id,
            settlementOutcome: settlement.outcome,
            settlementAmount: settlement.amount,
            currentBetStatus: bet.status,
            expectedBetStatus: expectedBetStatus,
            predictedOutcome: bet.predictedOutcome,
            matchOutcome: bet.match?.outcome,
          },
          detectedAt: new Date(),
        });
      }

      // Verify payout amounts for WON bets
      if (
        bet.status === BetStatus.WON &&
        Number(settlement.amount) !== Number(bet.potentialPayout)
      ) {
        inconsistencies.push({
          type: InconsistencyType.MISMATCHED_SETTLEMENT,
          severity: Severity.HIGH,
          entityType: 'Settlement',
          entityId: settlement.id,
          description: `Settlement amount (${settlement.amount}) doesn't match bet potential payout (${bet.potentialPayout})`,
          details: {
            settlementId: settlement.id,
            betId: bet.id,
            settlementAmount: settlement.amount,
            betPotentialPayout: bet.potentialPayout,
            betStatus: bet.status,
          },
          detectedAt: new Date(),
        });
      }
    }

    this.logger.log(`Found ${inconsistencies.length} mismatched settlements`);
    return inconsistencies;
  }

  /**
   * Detect stuck pending settlements - PENDING settlements older than threshold
   * Severity: MEDIUM to HIGH depending on age
   */
  async detectStuckPendingSettlements(): Promise<Inconsistency[]> {
    this.logger.log('Detecting stuck pending settlements...');

    const thresholdDate = new Date();
    thresholdDate.setHours(
      thresholdDate.getHours() - this.STUCK_SETTLEMENT_THRESHOLD_HOURS,
    );

    const stuckSettlements = await this.settlementRepository.find({
      where: {
        status: SettlementStatus.PENDING,
        createdAt: LessThan(thresholdDate),
      },
    });

    const inconsistencies: Inconsistency[] = [];

    for (const settlement of stuckSettlements) {
      const hoursStuck = Math.floor(
        (Date.now() - settlement.createdAt.getTime()) / (1000 * 60 * 60),
      );

      // HIGH severity if stuck for more than 48 hours, MEDIUM otherwise
      const severity = hoursStuck > 48 ? Severity.HIGH : Severity.MEDIUM;

      const bet = await this.betRepository.findOne({
        where: { id: settlement.betId },
        relations: ['user'],
      });

      inconsistencies.push({
        type: InconsistencyType.STUCK_PENDING_SETTLEMENT,
        severity,
        entityType: 'Settlement',
        entityId: settlement.id,
        description: `Settlement ${settlement.id} has been PENDING for ${hoursStuck} hours`,
        details: {
          settlementId: settlement.id,
          betId: settlement.betId,
          userId: bet?.userId,
          userEmail: bet?.user?.email,
          amount: settlement.amount,
          outcome: settlement.outcome,
          hoursStuck,
          createdAt: settlement.createdAt,
        },
        detectedAt: new Date(),
      });
    }

    this.logger.log(
      `Found ${inconsistencies.length} stuck pending settlements`,
    );
    return inconsistencies;
  }

  /**
   * Run full reconciliation - executes all checks and persists report
   */
  async runReconciliation(
    type: ReportType = ReportType.MANUAL,
  ): Promise<ReconciliationReport> {
    this.logger.log(`Starting ${type} reconciliation...`);

    // Create report record
    const report = this.reportRepository.create({
      status: ReportStatus.RUNNING,
      type,
      startedAt: new Date(),
      negativeBalanceCount: 0,
      orphanedBetCount: 0,
      mismatchedSettlementCount: 0,
      stuckPendingSettlementCount: 0,
      totalInconsistencies: 0,
      inconsistencies: [],
    });

    await this.reportRepository.save(report);

    try {
      // Run all detection methods
      const [
        negativeBalances,
        orphanedBets,
        mismatchedSettlements,
        stuckSettlements,
      ] = await Promise.all([
        this.detectNegativeBalances(),
        this.detectOrphanedBets(),
        this.detectMismatchedSettlements(),
        this.detectStuckPendingSettlements(),
      ]);

      const allInconsistencies = [
        ...negativeBalances,
        ...orphanedBets,
        ...mismatchedSettlements,
        ...stuckSettlements,
      ];

      // Update report with results
      report.status = ReportStatus.COMPLETED;
      report.completedAt = new Date();
      report.negativeBalanceCount = negativeBalances.length;
      report.orphanedBetCount = orphanedBets.length;
      report.mismatchedSettlementCount = mismatchedSettlements.length;
      report.stuckPendingSettlementCount = stuckSettlements.length;
      report.totalInconsistencies = allInconsistencies.length;
      report.inconsistencies = allInconsistencies;

      await this.reportRepository.save(report);

      this.logger.log(
        `Reconciliation completed. Total inconsistencies: ${allInconsistencies.length}`,
      );

      // Log summary by severity
      const criticalCount = allInconsistencies.filter(
        (i) => i.severity === Severity.CRITICAL,
      ).length;
      const highCount = allInconsistencies.filter(
        (i) => i.severity === Severity.HIGH,
      ).length;
      const mediumCount = allInconsistencies.filter(
        (i) => i.severity === Severity.MEDIUM,
      ).length;

      if (criticalCount > 0) {
        this.logger.error(
          `CRITICAL ISSUES FOUND: ${criticalCount} critical inconsistencies detected`,
        );
      }
      if (highCount > 0) {
        this.logger.warn(`High severity issues: ${highCount}`);
      }
      if (mediumCount > 0) {
        this.logger.log(`Medium severity issues: ${mediumCount}`);
      }

      return report;
    } catch (error) {
      report.status = ReportStatus.FAILED;
      report.completedAt = new Date();
      report.errorMessage = error instanceof Error ? error.message : String(error);
      await this.reportRepository.save(report);

      this.logger.error(`Reconciliation failed: ${report.errorMessage}`);
      throw error;
    }
  }

  /**
   * Get paginated report history
   */
  async getReports(page = 1, limit = 10): Promise<PaginatedReports> {
    const [data, total] = await this.reportRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific report by ID
   */
  async getReportById(id: string): Promise<ReconciliationReport | null> {
    return this.reportRepository.findOne({ where: { id } });
  }

  /**
   * Get latest report summary for dashboard widget
   */
  async getLatestReportSummary(): Promise<ReportSummary> {
    const latestReport = await this.reportRepository.findOne({
      where: { status: ReportStatus.COMPLETED },
      order: { createdAt: 'DESC' },
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayReports = await this.reportRepository
      .createQueryBuilder('report')
      .where('report.created_at >= :today', { today })
      .andWhere('report.status = :status', { status: ReportStatus.COMPLETED })
      .getMany();

    const totalInconsistenciesToday = todayReports.reduce(
      (sum, r) => sum + r.totalInconsistencies,
      0,
    );

    // Count critical issues from latest report
    const criticalIssuesCount =
      latestReport?.inconsistencies?.filter(
        (i) => i.severity === Severity.CRITICAL,
      ).length ?? 0;

    return {
      latestReport,
      totalReportsToday: todayReports.length,
      totalInconsistenciesToday,
      criticalIssuesCount,
      lastRunAt: latestReport?.completedAt ?? null,
    };
  }

  /**
   * Helper to determine expected bet status based on settlement outcome
   */
  private getExpectedBetStatus(
    settlementOutcome: string,
    predictedOutcome: string,
    matchOutcome: string | null | undefined,
  ): BetStatus | null {
    if (!matchOutcome) return null;

    // If outcomes match, bet should be WON
    if (predictedOutcome === matchOutcome) {
      return BetStatus.WON;
    }

    // If outcomes don't match, bet should be LOST
    return BetStatus.LOST;
  }
}
