import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldEnumInInvoiceTable1663679206797
  implements MigrationInterface
{
  name = 'addFieldEnumInInvoiceTable1663679206797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` CHANGE \`status\` \`status\` ENUM(\'pending\',\'unpaid\',\'rejected\',\'accepted\',\'done\') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT \'pending\'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
