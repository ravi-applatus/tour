import { MigrationInterface, QueryRunner } from 'typeorm';

export class tourismChange1671336314222 implements MigrationInterface {
  name = 'tourismChange1671336314222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel\` CHANGE \`code\` \`code\` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_hotel\` CHANGE \`number\` \`number\` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tourism\` ADD \`code\` VARCHAR(45) NULL AFTER \`name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`tourismNumber\` VARCHAR(45) NULL AFTER \`number\`;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
