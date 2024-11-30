import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNewFieldInUserAndWithdrawTable1661029476429
  implements MigrationInterface
{
  name = 'createNewFieldInUserAndWithdrawTable1661029476429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`ibanDollar\` VARCHAR(128) NULL AFTER \`identityCardNumber\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`ibanRial\` VARCHAR(128) NULL AFTER \`identityCardNumber\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`withdraw\` ADD \`rialRequest\` BOOLEAN NOT NULL AFTER \`amount\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
