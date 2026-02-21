import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSystemControlsTable1769490000000 implements MigrationInterface {
  name = 'AddSystemControlsTable1769490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "system_controls" (
        "key" character varying(64) NOT NULL,
        "is_paused" boolean NOT NULL DEFAULT false,
        "paused_at" TIMESTAMP,
        "paused_by" character varying(64),
        "pause_reason" text,
        "last_updated_by" character varying(64),
        CONSTRAINT "PK_system_controls_key" PRIMARY KEY ("key")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "system_controls" ("key", "is_paused")
      VALUES ('global_pause', false)
      ON CONFLICT ("key") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "system_controls"`);
  }
}
