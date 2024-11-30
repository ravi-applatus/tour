import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBuyPriceAndBuyAmountFields1666643743616
  implements MigrationInterface
{
  name = 'addBuyPriceAndBuyAmountFields1666643743616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel_room_price\` ADD \`buyPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`price\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_hotel\` ADD \`buyAmount\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_hotel_map_room\` ADD \`buyAmount\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice\` ADD \`buyAmount\` DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`amount\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
