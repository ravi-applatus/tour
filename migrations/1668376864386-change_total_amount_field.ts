import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTotalAmountField1668376864386 implements MigrationInterface {
  name = 'changeTotalAmountField1668376864386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` CHANGE \`totalDiscountAmount\` \`totalAmount\` DECIMAL(10,2) NOT NULL DEFAULT '0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_hotel\` CHANGE \`totalDiscountAmount\` \`totalAmount\` DECIMAL(10,2) NOT NULL DEFAULT '0.00'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
