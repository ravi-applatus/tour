import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeNameEnumFieldInWalletHistoryTable1661807446739
  implements MigrationInterface
{
  name = 'changeNameEnumFieldInWalletHistoryTable1661807446739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_wallet_history\` CHANGE \`type\` \`type\` ENUM(\'commission\',\'withdraw\') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
