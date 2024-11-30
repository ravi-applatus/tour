import { MigrationInterface, QueryRunner } from 'typeorm';

export class addQuantityFieldInMapRoomHotelTable1666131673969
  implements MigrationInterface
{
  name = 'addQuantityFieldInMapRoomHotelTable1666131673969';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_hotel_map_room\` ADD \`quantity\` INT NOT NULL DEFAULT '1' AFTER \`amount\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
