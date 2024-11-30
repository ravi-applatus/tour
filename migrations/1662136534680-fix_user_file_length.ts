import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixUserFileLength1662136534680 implements MigrationInterface {
  name = 'fixUserFileLength1662136534680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`identityCardFile\` \`identityCardFile\` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
