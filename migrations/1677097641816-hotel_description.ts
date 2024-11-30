import { MigrationInterface, QueryRunner } from 'typeorm';

export class hotelDescription1677097641816 implements MigrationInterface {
  name = 'hotelDescription1677097641816';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel\` ADD \`description\` TEXT NULL AFTER \`needOrderConfirmAvailability\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
