import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTour1684498136694 implements MigrationInterface {
  name = 'changeTour1684498136694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`invoice\` 
        ADD COLUMN \`transferId\` INT(11) NULL DEFAULT NULL AFTER \`discountAmount\`,
        ADD COLUMN \`transferAmount\` DECIMAL(10,2) NULL DEFAULT 0.00 AFTER \`transferId\`,
        ADD COLUMN \`transferBuyAmount\` DECIMAL(10,2) NULL DEFAULT 0.00 AFTER \`transferAmount\`,
        ADD INDEX \`fk_invoice_transfer1_idx\` (\`transferId\` ASC);`);

    await queryRunner.query(`ALTER TABLE \`tour\` 
        DROP COLUMN \`availabilityCount\`,
        DROP COLUMN \`to\`,
        DROP COLUMN \`from\`,
        DROP COLUMN \`originCountry\`,
        DROP COLUMN \`originCity\`;`);

    await queryRunner.query(`ALTER TABLE \`tour_price\` 
        DROP COLUMN \`buyChildPrice\`,
        DROP COLUMN \`childPrice\`;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`tour_child_price\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`tourPriceId\` INT(11) NOT NULL,
        \`ageFrom\` INT(11) NOT NULL,
        \`ageTo\` INT(11) NOT NULL,
        \`price\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
        \`buyPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
        PRIMARY KEY (\`id\`),
        INDEX \`fk_tour_child_price_tour_price1_idx\` (\`tourPriceId\` ASC),
        CONSTRAINT \`fk_tour_child_price_tour_price1\`
            FOREIGN KEY (\`tourPriceId\`)
            REFERENCES \`tour_price\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION)
        ENGINE = InnoDB
        DEFAULT CHARACTER SET = utf8
        COLLATE = utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`transfer\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(128) NOT NULL,
        \`price\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
        \`buyPrice\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
        \`description\` TEXT NULL DEFAULT NULL,
        \`isActive\` TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`))
        ENGINE = InnoDB
        DEFAULT CHARACTER SET = utf8
        COLLATE = utf8_unicode_ci;`);

    await queryRunner.query(`ALTER TABLE \`invoice\` 
        ADD CONSTRAINT \`fk_invoice_transfer1\`
        FOREIGN KEY (\`transferId\`)
        REFERENCES \`transfer\` (\`id\`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
