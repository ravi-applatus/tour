import { MigrationInterface, QueryRunner } from 'typeorm';

export class hotelChanges1671123502045 implements MigrationInterface {
  name = 'hotelChanges1671123502045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`hotel\` 
ADD COLUMN \`code\` VARCHAR(45) NOT NULL AFTER \`name\``);

    await queryRunner.query(`ALTER TABLE \`hotel_room_price\` 
ADD COLUMN \`from\` DATETIME NULL DEFAULT NULL AFTER \`buyPrice\`,
ADD COLUMN \`to\` DATETIME NULL DEFAULT NULL AFTER \`from\``);

    await queryRunner.query(`ALTER TABLE \`order_hotel\` 
ADD COLUMN \`number\` VARCHAR(45) NOT NULL AFTER \`id\`,
ADD COLUMN \`arrivalDate\` DATETIME NULL DEFAULT NULL AFTER \`transportCompany\`,
ADD COLUMN \`arrivalNumber\` VARCHAR(45) NULL DEFAULT NULL AFTER \`arrivalDate\`,
ADD COLUMN \`departureDate\` DATETIME NULL DEFAULT NULL AFTER \`arrivalNumber\`,
ADD COLUMN \`departureNumber\` VARCHAR(45) NULL DEFAULT NULL AFTER \`departureDate\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
