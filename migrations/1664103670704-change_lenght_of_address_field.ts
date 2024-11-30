import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeLenghtOfAddressField1664103670704
  implements MigrationInterface
{
  name = 'changeLenghtOfAddressField1664103670704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel\` CHANGE \`address\` \`address\` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
