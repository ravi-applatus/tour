import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTourismNumber1674929407645 implements MigrationInterface {
  name = 'changeTourismNumber1674929407645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` CHANGE \`tourismNumber\` \`systemNumber\` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`tourismNumber\` INT NULL AFTER \`number\`;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
