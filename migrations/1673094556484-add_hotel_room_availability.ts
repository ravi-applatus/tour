import { MigrationInterface, QueryRunner } from 'typeorm';

export class addHotelRoomAvailability1673094556484
  implements MigrationInterface
{
  name = 'addHotelRoomAvailability1673094556484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`hotel_room\` 
        DROP COLUMN \`reservedCount\`,
        DROP COLUMN \`availabilityCount\``);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_room_availability\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`roomId\` INT(11) NOT NULL,
        \`availabilityCount\` INT(11) NOT NULL DEFAULT 0,
        \`reservedCount\` INT(11) NOT NULL DEFAULT 0,
        \`date\` DATE NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`fk_hotel_room_availability_hotel_room1_idx\` (\`roomId\` ASC),
        CONSTRAINT \`fk_hotel_room_availability_hotel_room1\`
            FOREIGN KEY (\`roomId\`)
            REFERENCES \`hotel_room\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION)
        ENGINE = InnoDB
        DEFAULT CHARACTER SET = utf8
        COLLATE = utf8_unicode_ci`);

    await queryRunner.query(
      `ALTER TABLE \`hotel_room_price\` CHANGE \`from\` \`from\` DATE NULL DEFAULT NULL, CHANGE \`to\` \`to\` DATE NULL DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
