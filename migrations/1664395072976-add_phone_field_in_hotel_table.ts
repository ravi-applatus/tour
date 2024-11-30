import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPhoneFieldInHotelTable1664395072976
  implements MigrationInterface
{
  name = 'addPhoneFieldInHotelTable1664395072976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel\` ADD \`phone\` VARCHAR(45) NULL AFTER \`star\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`number\` VARCHAR(45) NOT NULL AFTER \`paymentId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`voucherHotelFile\` VARCHAR(128) NULL AFTER \`invoiceFile\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_hotel\` DROP \`voucherFile\`;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
