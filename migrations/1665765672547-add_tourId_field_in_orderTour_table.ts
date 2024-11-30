import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTourIdFieldInOrderTourTable1665765672547
  implements MigrationInterface
{
  name = 'addTourIdFieldInOrderTourTable1665765672547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tour\` ADD \`tourId\` INT(11) NOT NULL AFTER \`id\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
