import { MigrationInterface, QueryRunner } from 'typeorm';

export class createEmailFieldInHotelTable1667391449985
  implements MigrationInterface
{
  name = 'createEmailFieldInHotelTable1667391449985';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel\` ADD \`email\` VARCHAR(255) NULL AFTER \`phone\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hotel\` ADD \`managerName\` VARCHAR(128) NULL DEFAULT NULL AFTER \`email\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
