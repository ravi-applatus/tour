import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTypeOfCreatedAtFieldInWithdrawTable1661461945570
  implements MigrationInterface
{
  name = 'changeTypeOfCreatedAtFieldInWithdrawTable1661461945570';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`withdraw\` CHANGE \`createdAt\` \`createdAt\` DATETIME NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
