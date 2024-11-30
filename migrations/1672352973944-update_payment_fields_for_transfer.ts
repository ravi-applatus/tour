import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatePaymentFieldsForTransfer1672352973944
  implements MigrationInterface
{
  name = 'updatePaymentFieldsForTransfer1672352973944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment\` ADD \`transferFile\` VARCHAR(128) NULL AFTER \`referenceNumber\`, ADD \`transferDescription\` TEXT NULL AFTER \`transferFile\`;`,
    );

    await queryRunner.query(
      `ALTER TABLE \`payment\` ADD \`method\` ENUM('online','transfer') NOT NULL DEFAULT 'online' AFTER \`transferDescription\`;`,
    );

    await queryRunner.query(
      `ALTER TABLE \`payment\` ADD \`reasonRejected\` TEXT NULL AFTER \`status\`;`,
    );

    await queryRunner.query(
      `ALTER TABLE \`payment\` CHANGE \`status\` \`status\` ENUM('pending','done','failed','rejected') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'pending';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
