import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ReportStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReportType {
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
}

export enum InconsistencyType {
  NEGATIVE_BALANCE = 'negative_balance',
  ORPHANED_BET = 'orphaned_bet',
  MISMATCHED_SETTLEMENT = 'mismatched_settlement',
  STUCK_PENDING_SETTLEMENT = 'stuck_pending_settlement',
}

export enum Severity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Inconsistency {
  type: InconsistencyType;
  severity: Severity;
  entityType: string;
  entityId: string;
  description: string;
  details: Record<string, unknown>;
  detectedAt: Date;
}

@Entity('reconciliation_reports')
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
@Index(['status', 'createdAt'])
export class ReconciliationReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.RUNNING,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'negative_balance_count', type: 'int', default: 0 })
  negativeBalanceCount: number;

  @Column({ name: 'orphaned_bet_count', type: 'int', default: 0 })
  orphanedBetCount: number;

  @Column({ name: 'mismatched_settlement_count', type: 'int', default: 0 })
  mismatchedSettlementCount: number;

  @Column({ name: 'stuck_pending_settlement_count', type: 'int', default: 0 })
  stuckPendingSettlementCount: number;

  @Column({ name: 'total_inconsistencies', type: 'int', default: 0 })
  totalInconsistencies: number;

  @Column({ type: 'json', nullable: true })
  inconsistencies: Inconsistency[] | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
