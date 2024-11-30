import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTourCommissionFieldInTourismLevelTable1668729950481
  implements MigrationInterface
{
  name = 'addTourCommissionFieldInTourismLevelTable1668729950481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tourism_level\` ADD \`tourCommissionPercent\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`hotelCommissionPercent\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
