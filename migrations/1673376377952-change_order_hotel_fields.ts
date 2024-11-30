import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeOrderHotelFields1673376377952 implements MigrationInterface {
  name = 'changeOrderHotelFields1673376377952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`order_hotel\` CHANGE \`transportType\` \`arrivalAirline\` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL, CHANGE \`transportCompany\` \`departureAirline\` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;
    `);

    await queryRunner.query(`
        ALTER TABLE \`setting\` ADD \`voucherDescription\` TEXT NULL AFTER \`bankTransferDescription\`, ADD \`transferBoard\` VARCHAR(45) NULL AFTER \`voucherDescription\`, ADD \`transferPhone\` VARCHAR(45) NULL AFTER \`transferBoard\`, ADD \`transferPhone2\` VARCHAR(45) NULL AFTER \`transferPhone\`, ADD \`transferExcursion\` VARCHAR(45) NULL AFTER \`transferPhone2\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
