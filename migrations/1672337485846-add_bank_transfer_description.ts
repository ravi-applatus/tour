import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBankTransferDescription1672337485846
  implements MigrationInterface
{
  name = 'addBankTransferDescription1672337485846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`setting\` ADD \`bankTransferDescription\` TEXT NULL AFTER \`passengersInfoUpdateDeadlineHours\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
