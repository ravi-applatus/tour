import { MigrationInterface, QueryRunner } from 'typeorm';

export class hugeUpdateHotel1659879993166 implements MigrationInterface {
  name = 'hugeUpdateHotel1659879993166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;`,
    );
    await queryRunner.query(
      `SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;`,
    );

    await queryRunner.query(`
        ALTER TABLE \`currency\` 
        CHANGE COLUMN \`status\` \`isActive\` TINYINT(4) NOT NULL DEFAULT '1'
    `);

    await queryRunner.query(`
        ALTER TABLE \`customer\` 
        ADD COLUMN \`phone\` VARCHAR(45) NULL DEFAULT NULL AFTER \`mobile\`,
        ADD COLUMN \`birthday\` DATE NULL DEFAULT NULL AFTER \`email\`,
        ADD COLUMN \`gender\` ENUM('male', 'female', 'other') NOT NULL DEFAULT 'male' AFTER \`birthday\`,
        ADD COLUMN \`disability\` VARCHAR(128) NULL DEFAULT NULL AFTER \`gender\`,
        ADD COLUMN \`passportFile\` VARCHAR(128) NULL DEFAULT NULL AFTER \`identityCardNumber\`,
        ADD COLUMN \`passportNumber\` VARCHAR(45) NULL DEFAULT NULL AFTER \`passportFile\`,
        CHANGE COLUMN \`mobile\` \`mobile\` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL
    `);

    await queryRunner.query(`
        ALTER TABLE \`hotel\` 
        DROP COLUMN \`isActive\`,
        ADD COLUMN \`state\` VARCHAR(45) NOT NULL AFTER \`country\`,
        ADD COLUMN \`status\` ENUM('new', 'updated', 'verified', 'rejected', 'inactive') NOT NULL DEFAULT 'new' AFTER \`needOrderConfirmAvailability\`,
        ADD COLUMN \`reasonRejected\` VARCHAR(255) NULL DEFAULT NULL AFTER \`status\`,
        ADD COLUMN \`updatedAt\` DATETIME NULL DEFAULT NULL AFTER \`createdAt\`,
        CHANGE COLUMN \`needOrderConfirm\` \`needOrderConfirmAvailability\` TINYINT(4) NOT NULL DEFAULT '0' AFTER \`coverId\`
    `);

    await queryRunner.query(`
        ALTER TABLE \`hotel_level_offer\` 
        ADD COLUMN \`hotelId\` INT(11) NOT NULL AFTER \`levelId\`,
        ADD COLUMN \`isActive\` TINYINT(4) NOT NULL DEFAULT 1 AFTER \`to\`,
        CHANGE COLUMN \`reserveFrom\` \`from\` DATETIME NULL DEFAULT NULL ,
        CHANGE COLUMN \`reserveTo\` \`to\` DATETIME NULL DEFAULT NULL ,
        ADD INDEX \`fk_hotel_level_offer_hotel1_idx\` (\`hotelId\` ASC)
    `);

    await queryRunner.query(`
        ALTER TABLE \`hotel_room\` 
        ADD COLUMN \`availabilityCount\` INT(11) NOT NULL DEFAULT 0 AFTER \`bedCount\`,
        ADD COLUMN \`reservedCount\` INT(11) NOT NULL DEFAULT 0 AFTER \`availabilityCount\`,
        CHANGE COLUMN \`name\` \`name\` VARCHAR(128) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel\` 
        ADD COLUMN \`invoiceFile\` VARCHAR(128) NULL DEFAULT NULL AFTER \`paymentId\`,
        ADD COLUMN \`description\` VARCHAR(255) NULL DEFAULT NULL AFTER \`checkOut\`,
        ADD COLUMN \`transportType\` VARCHAR(45) NULL DEFAULT NULL AFTER \`description\`,
        ADD COLUMN \`transportCompany\` VARCHAR(45) NULL DEFAULT NULL AFTER \`transportType\`,
        ADD COLUMN \`availabilityStatus\` ENUM('systemVerified', 'waiting', 'verified', 'rejected') NOT NULL DEFAULT 'systemVerified' AFTER \`reasonRejected\`,
        ADD COLUMN \`availabilityReasonRejected\` VARCHAR(255) NULL DEFAULT NULL AFTER \`availabilityStatus\`,
        ADD COLUMN \`passengersInfoStatus\` ENUM('waiting', 'verified', 'rejected') NOT NULL DEFAULT 'waiting' AFTER \`availabilityReasonRejected\`,
        ADD COLUMN \`passengersInfoReasonRejected\` VARCHAR(255) NULL DEFAULT NULL AFTER \`passengersInfoStatus\`,
        ADD COLUMN \`passengersInfoUpdateDeadline\` DATETIME NULL DEFAULT NULL AFTER \`passengersInfoReasonRejected\`,
        ADD COLUMN \`updatedAt\` DATETIME NULL DEFAULT NULL AFTER \`createdAt\`,
        CHANGE COLUMN \`reservedDate\` \`checkIn\` DATE NOT NULL ,
        CHANGE COLUMN \`reservedCountDay\` \`checkOut\` DATE NOT NULL ,
        CHANGE COLUMN \`status\` \`status\` ENUM('pending', 'unpaid', 'rejected', 'done') CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL DEFAULT 'pending'
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel_passenger\` 
        ADD COLUMN \`age\` INT(11) NULL DEFAULT NULL AFTER \`mobile\`,
        ADD COLUMN \`disability\` VARCHAR(128) NULL DEFAULT NULL AFTER \`age\`,
        ADD COLUMN \`passportFile\` VARCHAR(128) NULL DEFAULT NULL AFTER \`identityCardNumber\`,
        ADD COLUMN \`passportNumber\` VARCHAR(45) NULL DEFAULT NULL AFTER \`passportFile\`,
        ADD COLUMN \`createdAt\` DATETIME NOT NULL AFTER \`isLeader\`,
        CHANGE COLUMN \`identityCardNumber\` \`identityCardNumber\` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL ,
        CHANGE COLUMN \`isSupervisor\` \`isLeader\` TINYINT(4) NOT NULL DEFAULT '1'
    `);

    await queryRunner.query(`
        ALTER TABLE \`payment\` 
        ADD COLUMN \`message\` VARCHAR(255) NULL DEFAULT NULL AFTER \`status\`,
        ADD COLUMN \`referenceNumber\` VARCHAR(128) NULL DEFAULT NULL AFTER \`message\`
    `);

    await queryRunner.query(`
        ALTER TABLE \`tourism\` 
        ADD COLUMN \`licenseFile\` VARCHAR(128) NOT NULL AFTER \`levelId\`,
        ADD COLUMN \`address\` VARCHAR(128) NOT NULL AFTER \`licenseFile\`,
        ADD COLUMN \`reasonRejected\` VARCHAR(255) NULL DEFAULT NULL AFTER \`status\`,
        ADD COLUMN \`updatedAt\` DATETIME NULL DEFAULT NULL AFTER \`createdAt\`,
        CHANGE COLUMN \`isActive\` \`status\` ENUM('new', 'updated', 'verified', 'rejected', 'inactive') NOT NULL DEFAULT 'new'
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS \`setting\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`startWorkingTime\` TIME NULL DEFAULT NULL,
        \`endWorkingTime\` TIME NULL DEFAULT NULL,
        \`passengersInfoUpdateDeadlineHours\` INT NULL,
        PRIMARY KEY (\`id\`))
        ENGINE = InnoDB
        DEFAULT CHARACTER SET = utf8
        COLLATE = utf8_unicode_ci
    `);

    await queryRunner.query(`
        DROP TABLE IF EXISTS \`hotel_offer\`
    `);

    await queryRunner.query(`
        ALTER TABLE \`hotel_level_offer\` 
        ADD CONSTRAINT \`fk_hotel_level_offer_hotel1\`
        FOREIGN KEY (\`hotelId\`)
        REFERENCES \`hotel\` (\`id\`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    `);

    await queryRunner.query(`SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;`);

    await queryRunner.query(`SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
