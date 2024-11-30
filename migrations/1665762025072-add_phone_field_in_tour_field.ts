import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPhoneFieldInTourField1665762025072
  implements MigrationInterface
{
  name = 'addPhoneFieldInTourField1665762025072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tour\` ADD \`phone\` VARCHAR(45) NULL AFTER \`name\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
