import { MigrationInterface, QueryRunner } from 'typeorm';

export class deleteTransportTypeFieldFromOrderTourTable1666127706793
  implements MigrationInterface
{
  name = 'deleteTransportTypeFieldFromOrderTourTable1666127706793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tour\` DROP \`transportType\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`tour\` ADD \`transportType\` VARCHAR(45) NULL AFTER \`to\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
