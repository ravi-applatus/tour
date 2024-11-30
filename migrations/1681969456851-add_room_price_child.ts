import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRoomPriceChild1681969456851 implements MigrationInterface {
  name = 'addRoomPriceChild1681969456851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_room_child_price\` (
            \`id\` INT(11) NOT NULL AUTO_INCREMENT,
            \`roomPriceId\` INT(11) NOT NULL,
            \`ageFrom\` INT(11) NOT NULL,
            \`ageTo\` INT(11) NOT NULL,
            \`price\` DECIMAL(10,2) NOT NULL,
            \`buyPrice\` DECIMAL(10,2) NOT NULL,
            PRIMARY KEY (\`id\`),
            INDEX \`fk_hotel_room_child_price_hotel_room_price1_idx\` (\`roomPriceId\` ASC),
            CONSTRAINT \`fk_hotel_room_child_price_hotel_room_price1\`
              FOREIGN KEY (\`roomPriceId\`)
              REFERENCES \`hotel_room_price\` (\`id\`)
              ON DELETE NO ACTION
              ON UPDATE NO ACTION)
          ENGINE = InnoDB
          DEFAULT CHARACTER SET = utf8
          COLLATE = utf8_unicode_ci;`);

    await queryRunner.query(`ALTER TABLE \`hotel_room_child_price\` 
          CHANGE COLUMN \`price\` \`price\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
          CHANGE COLUMN \`buyPrice\` \`buyPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0.00';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
