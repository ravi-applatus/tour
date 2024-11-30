import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationTypes1677960767290 implements MigrationInterface {
  name = 'addNotificationTypes1677960767290';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` CHANGE \`type\` \`type\` ENUM('invoice','payment','withdraw','signup_request') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'invoice'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
