import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldChildPricePercentInHotelTable1667498137347
  implements MigrationInterface
{
  name = 'addFieldChildPricePercentInHotelTable1667498137347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel\` ADD \`childPricePercent\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`needOrderConfirmAvailability\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
