import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPhoneFieldInTourismTable1667746308886
  implements MigrationInterface
{
  name = 'addPhoneFieldInTourismTable1667746308886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tourism\` ADD \`phone\` VARCHAR(45) NULL AFTER \`address\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
