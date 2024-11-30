import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewCommissionFieldInOrderTourTable1684786177192
  implements MigrationInterface
{
  name = 'addNewCommissionFieldInOrderTourTable1684786177192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tour\` ADD \`commission\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`buyAmount\`;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
