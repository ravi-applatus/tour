import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldsTour1684428494530 implements MigrationInterface {
  name = 'addFieldsTour1684428494530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tour\` ADD \`voucherPassengerFile\` VARCHAR(128) NULL AFTER \`description\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`tour\` ADD \`brochureFile\` VARCHAR(128) NULL AFTER \`transportType\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`tour_price\` ADD \`childPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0.00' AFTER \`buyPrice\`, ADD \`buyChildPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0.00' AFTER \`childPrice\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
