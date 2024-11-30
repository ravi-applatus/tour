import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldInInvoiceAndOrderHotelTable1667480687680
  implements MigrationInterface
{
  name = 'addFieldInInvoiceAndOrderHotelTable1667480687680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` DROP \`voucherHotelFile\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`voucherSaleFile\` VARCHAR(128) NULL AFTER \`invoiceFile\`, ADD \`voucherBuyFile\` VARCHAR(128) NULL AFTER \`voucherSaleFile\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_hotel\` ADD \`voucherReserveFile\` VARCHAR(128) NULL AFTER \`transportCompany\`, ADD \`voucherPassengerFile\` VARCHAR(128) NULL AFTER \`voucherReserveFile\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
