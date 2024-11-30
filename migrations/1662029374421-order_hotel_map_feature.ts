import { MigrationInterface, QueryRunner } from 'typeorm';

export class orderHotelMapFeature1662029374421 implements MigrationInterface {
  name = 'orderHotelMapFeature1662029374421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS \`order_hotel_map_feature\` (
            \`id\` INT(11) NOT NULL AUTO_INCREMENT,
            \`orderHotelId\` INT(11) NOT NULL,
            \`hotelFetureId\` INT(11) NOT NULL,
            \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            PRIMARY KEY (\`id\`),
            INDEX \`fk_order_hotel_map_feature_order_hotel1_idx\` (\`orderHotelId\` ASC),
            INDEX \`fk_order_hotel_map_feature_hotel_feature1_idx\` (\`hotelFetureId\` ASC),
            CONSTRAINT \`fk_order_hotel_map_feature_order_hotel1\`
                FOREIGN KEY (\`orderHotelId\`)
                REFERENCES \`order_hotel\` (\`id\`)
                ON DELETE NO ACTION
                ON UPDATE NO ACTION,
            CONSTRAINT \`fk_order_hotel_map_feature_hotel_feature1\`
                FOREIGN KEY (\`hotelFetureId\`)
                REFERENCES \`hotel_feature\` (\`id\`)
                ON DELETE NO ACTION
                ON UPDATE NO ACTION)
            ENGINE = InnoDB
            DEFAULT CHARACTER SET = utf8
            COLLATE = utf8_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
