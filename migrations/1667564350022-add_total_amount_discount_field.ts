import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTotalAmountDiscountField1667564350022
  implements MigrationInterface
{
  name = 'addTotalAmountDiscountField1667564350022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`totalAmountDiscount\` DECIMAL(10,2) NULL DEFAULT '0' AFTER \`discountAmount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_hotel\` ADD \`totalAmountDiscount\` DECIMAL(10,2) NULL DEFAULT '0' AFTER \`discountAmount\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
