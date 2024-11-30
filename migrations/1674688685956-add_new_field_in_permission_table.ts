import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewFieldInPermissionTable1674688685956
  implements MigrationInterface
{
  name = 'addNewFieldInPermissionTable1674688685956';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`permission\` ADD \`category\` VARCHAR(128) NOT NULL AFTER \`name\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
