import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewFieldsInSettingTable1674518799720
  implements MigrationInterface
{
  name = 'addNewFieldsInSettingTable1674518799720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`setting\` ADD \`adminName\` VARCHAR(45) NULL AFTER 
        \`transferExcursion\`, ADD \`adminPhone\` VARCHAR(45) NULL AFTER \`adminName\`,
         ADD \`adminFax\` VARCHAR(45) NULL AFTER \`adminPhone\``);

    await queryRunner.query(
      `ALTER TABLE \`setting\` ADD \`adminEmail\` VARCHAR(255) NULL AFTER \`adminFax\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
