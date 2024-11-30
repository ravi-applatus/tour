import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewField1667216936856 implements MigrationInterface {
  name = 'addNewField1667216936856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel_level_offer\` ADD \`discount\` DECIMAL(10,2) NULL DEFAULT '0.00' AFTER \`to\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hotel\` ADD \`locationLat\` VARCHAR(45) NULL AFTER \`address\`, ADD \`locationLng\` VARCHAR(45) NULL AFTER \`locationLat\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
