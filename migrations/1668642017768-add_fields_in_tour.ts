import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldsInTour1668642017768 implements MigrationInterface {
  name = 'addFieldsInTour1668642017768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tour\` ADD \`managerName\` VARCHAR(128) NULL AFTER \`name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tour_price\` ADD \`buyPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`price\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tour\` ADD \`buyAmount\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`amount\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
