import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTypeOfPriceFieldInHotelPriceRoomTable1660510790795
  implements MigrationInterface
{
  name = 'changeTypeOfPriceFieldInHotelPriceRoomTable1660510790795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel_room_price\` CHANGE \`price\` \`price\` DECIMAL(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
