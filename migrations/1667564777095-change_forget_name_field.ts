import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeForgetNameField1667564777095 implements MigrationInterface {
  name = 'changeForgetNameField1667564777095';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` CHANGE \`totalAmountDiscount\` \`totalDiscountAmount\` DECIMAL(10,2) NULL DEFAULT '0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_hotel\` CHANGE \`totalAmountDiscount\` \`totalDiscountAmount\` DECIMAL(10,2) NULL DEFAULT '0.00'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
