import { MigrationInterface, QueryRunner } from 'typeorm';

export class tourBranch1664630356575 implements MigrationInterface {
  name = 'tourBranch1664630356575';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;`,
    );
    await queryRunner.query(
      `SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;`,
    );

    await queryRunner.query(`
ALTER TABLE \`invoice\` 
ADD COLUMN \`tourTicketFile\` VARCHAR(128) NULL DEFAULT NULL AFTER \`invoiceBuyFile\`;
    `);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`tour\` (
  \`id\` INT(11) NOT NULL,
  \`userId\` INT(11) NOT NULL,
  \`coverId\` INT(11) NULL DEFAULT NULL,
  \`name\` VARCHAR(45) NOT NULL,
  \`originCity\` VARCHAR(45) NOT NULL,
  \`originCountry\` VARCHAR(45) NOT NULL,
  \`destinationCity\` VARCHAR(45) NOT NULL,
  \`destinationCountry\` VARCHAR(45) NOT NULL,
  \`from\` DATE NOT NULL,
  \`to\` DATE NOT NULL,
  \`availabilityCount\` INT(11) NOT NULL DEFAULT '0',
  \`reservedCount\` INT(11) NOT NULL DEFAULT '0',
  \`status\` ENUM('new', 'updated', 'verified', 'rejected', 'inactive') NOT NULL DEFAULT 'new',
  \`reasonRejected\` VARCHAR(225) NULL DEFAULT NULL,
  \`createdAt\` DATETIME NOT NULL,
  \`updatedAt\` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_tour_tour_image1_idx\` (\`coverId\` ASC),
  INDEX \`fk_tour_user1_idx\` (\`userId\` ASC),
  CONSTRAINT \`fk_tour_tour_image1\`
    FOREIGN KEY (\`coverId\`)
    REFERENCES \`tour_image\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT \`fk_tour_user1\`
    FOREIGN KEY (\`userId\`)
    REFERENCES \`user\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`tour_image\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`tourId\` INT(11) NOT NULL,
  \`pathFile\` VARCHAR(128) NOT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_tour_image_tour1_idx\` (\`tourId\` ASC),
  CONSTRAINT \`fk_tour_image_tour1\`
    FOREIGN KEY (\`tourId\`)
    REFERENCES \`tour\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`tour_map_feature\` (
  \`id\` INT(11) NOT NULL,
  \`tourFeatureId\` INT(11) NOT NULL,
  \`tourId\` INT(11) NOT NULL,
  \`isOptional\` TINYINT(4) NOT NULL,
  \`price\` DECIMAL(10,2) NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_tour_map_feature_tour_feature1_idx\` (\`tourFeatureId\` ASC),
  INDEX \`fk_tour_map_feature_tour1_idx\` (\`tourId\` ASC),
  CONSTRAINT \`fk_tour_map_feature_tour_feature1\`
    FOREIGN KEY (\`tourFeatureId\`)
    REFERENCES \`tour_feature\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT \`fk_tour_map_feature_tour1\`
    FOREIGN KEY (\`tourId\`)
    REFERENCES \`tour\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`tour_feature\` (
  \`id\` INT(11) NOT NULL,
  \`title\` VARCHAR(45) NOT NULL,
  \`icon\` VARCHAR(128) NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`tour_price\` (
  \`id\` INT(11) NOT NULL,
  \`levelId\` INT(11) NOT NULL,
  \`tourId\` INT(11) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_tour_price_tourism_level1_idx\` (\`levelId\` ASC),
  INDEX \`fk_tour_price_tour1_idx\` (\`tourId\` ASC),
  CONSTRAINT \`fk_tour_price_tourism_level1\`
    FOREIGN KEY (\`levelId\`)
    REFERENCES \`tourism_level\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT \`fk_tour_price_tour1\`
    FOREIGN KEY (\`tourId\`)
    REFERENCES \`tour\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`order_tour\` (
  \`id\` INT(11) NOT NULL,
  \`invoiceId\` INT(11) NULL DEFAULT NULL,
  \`userId\` INT(11) NOT NULL,
  \`tourismId\` INT(11) NULL DEFAULT NULL,
  \`amount\` DECIMAL(10,2) NOT NULL,
  \`description\` VARCHAR(225) NULL DEFAULT NULL,
  \`transportType\` VARCHAR(45) NULL DEFAULT NULL,
  \`createdAt\` DATETIME NOT NULL,
  \`updatedAt\` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_order_tour_invoice1_idx\` (\`invoiceId\` ASC),
  INDEX \`fk_order_tour_user1_idx\` (\`userId\` ASC),
  INDEX \`fk_order_tour_tourism1_idx\` (\`tourismId\` ASC),
  CONSTRAINT \`fk_order_tour_invoice1\`
    FOREIGN KEY (\`invoiceId\`)
    REFERENCES \`invoice\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT \`fk_order_tour_user1\`
    FOREIGN KEY (\`userId\`)
    REFERENCES \`user\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT \`fk_order_tour_tourism1\`
    FOREIGN KEY (\`tourismId\`)
    REFERENCES \`tourism\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`order_tour_map_feature\` (
  \`id\` INT(11) NOT NULL,
  \`orderTourId\` INT(11) NOT NULL,
  \`tourFeatureId\` INT(11) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_order_tour_map_feature_order_tour1_idx\` (\`orderTourId\` ASC),
  INDEX \`fk_order_tour_map_feature_tour_feature1_idx\` (\`tourFeatureId\` ASC),
  CONSTRAINT \`fk_order_tour_map_feature_order_tour1\`
    FOREIGN KEY (\`orderTourId\`)
    REFERENCES \`order_tour\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT \`fk_order_tour_map_feature_tour_feature1\`
    FOREIGN KEY (\`tourFeatureId\`)
    REFERENCES \`tour_feature\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
    ALTER TABLE \`order_tour\` 
CHANGE COLUMN \`id\` \`id\` INT(11) NOT NULL AUTO_INCREMENT ;
    `);

    await queryRunner.query(`
ALTER TABLE \`order_tour_map_feature\` 
CHANGE COLUMN \`id\` \`id\` INT(11) NOT NULL AUTO_INCREMENT ;
    `);

    await queryRunner.query(`
ALTER TABLE \`tour\` 
CHANGE COLUMN \`id\` \`id\` INT(11) NOT NULL AUTO_INCREMENT ;
    `);

    await queryRunner.query(`
ALTER TABLE \`tour_map_feature\` 
CHANGE COLUMN \`id\` \`id\` INT(11) NOT NULL AUTO_INCREMENT ;
    `);

    await queryRunner.query(`
    ALTER TABLE \`tour_price\` 
CHANGE COLUMN \`id\` \`id\` INT(11) NOT NULL AUTO_INCREMENT ;
    `);

    await queryRunner.query(`
    ALTER TABLE \`tour_feature\` 
CHANGE COLUMN \`id\` \`id\` INT(11) NOT NULL AUTO_INCREMENT ;
    `);

    await queryRunner.query(`SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;`);

    await queryRunner.query(`SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
