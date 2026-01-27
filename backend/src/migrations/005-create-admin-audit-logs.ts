import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAdminAuditLogs005 implements MigrationInterface {
  name = 'CreateAdminAuditLogs005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'admin_audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'admin_id',
            type: 'uuid',
          },
          {
            name: 'action_type',
            type: 'enum',
            enum: ['bet_cancelled', 'balance_corrected', 'match_corrected'],
          },
          {
            name: 'affected_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'affected_entity_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'affected_entity_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Type of affected entity: bet, match, user, etc.',
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'previous_values',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'new_values',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign key for admin_id
    await queryRunner.createForeignKey(
      'admin_audit_logs',
      new TableForeignKey({
        columnNames: ['admin_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        name: 'FK_admin_audit_logs_admin_id',
      }),
    );

    // Create indexes for common queries
    await queryRunner.createIndex(
      'admin_audit_logs',
      new TableIndex({
        name: 'IDX_admin_audit_logs_admin_id',
        columnNames: ['admin_id'],
      }),
    );

    await queryRunner.createIndex(
      'admin_audit_logs',
      new TableIndex({
        name: 'IDX_admin_audit_logs_action_type',
        columnNames: ['action_type'],
      }),
    );

    await queryRunner.createIndex(
      'admin_audit_logs',
      new TableIndex({
        name: 'IDX_admin_audit_logs_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'admin_audit_logs',
      new TableIndex({
        name: 'IDX_admin_audit_logs_affected_user_id',
        columnNames: ['affected_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'admin_audit_logs',
      new TableIndex({
        name: 'IDX_admin_audit_logs_admin_id_created_at',
        columnNames: ['admin_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'admin_audit_logs',
      new TableIndex({
        name: 'IDX_admin_audit_logs_action_type_created_at',
        columnNames: ['action_type', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('admin_audit_logs');
  }
}
