import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldInRoomAndRoomPriceTabels1668198443919
  implements MigrationInterface
{
  name = 'addFieldInRoomAndRoomPriceTabels1668198443919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel_room\` ADD \`type\` VARCHAR(128) NULL AFTER \`name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hotel_room\` ADD \`maxExtraCapacity\` INT(11) NOT NULL DEFAULT '0' AFTER \`bedCount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hotel_room\` CHANGE \`bedCount\` \`maxCapacity\` INT(11) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`hotel_room_price\` ADD \`childExtraPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`price\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`hotel_room_price\` ADD \`childExtraBuyPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`price\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
