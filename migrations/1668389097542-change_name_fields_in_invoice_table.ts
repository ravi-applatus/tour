import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeNameFieldsInInvoiceTable1668389097542
  implements MigrationInterface
{
  name = 'changeNameFieldsInInvoiceTable1668389097542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`invoice\` DROP \`invoiceFile\``);
    await queryRunner.query(
      `ALTER TABLE \`invoice\` CHANGE \`voucherSaleFile\` \`invoiceSaleFile\` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` CHANGE \`voucherBuyFile\` \`invoiceBuyFile\` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
