import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldDiscountAmountInOrderHotelAndInvoiceTabels1667495652248
  implements MigrationInterface
{
  name = 'addFieldDiscountAmountInOrderHotelAndInvoiceTabels1667495652248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_hotel\` ADD \`discountAmount\` DECIMAL(10,2) NULL DEFAULT '0' AFTER \`buyAmount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`discountAmount\` DECIMAL(10,2) NULL DEFAULT '0' AFTER \`buyAmount\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
