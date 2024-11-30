import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeCountOfCharachterRandomHashFieldInUserTable1661774311640
  implements MigrationInterface
{
  name = 'changeCountOfCharachterRandomHashFieldInUserTable1661774311640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`randomHash\` \`randomHash\` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
