import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBuyPriceFieldInOrderTourTable1668644599845
  implements MigrationInterface
{
  name = 'addBuyPriceFieldInOrderTourTable1668644599845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tour\` ADD \`buyPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`price\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
