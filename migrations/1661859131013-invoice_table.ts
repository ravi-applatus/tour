import { MigrationInterface, QueryRunner } from 'typeorm';

export class invoiceTable1661859131013 implements MigrationInterface {
  name = 'invoiceTable1661859131013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;`,
    );
    await queryRunner.query(
      `SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;`,
    );

    await queryRunner.query(`
        ALTER TABLE \`order_hotel\` 
        DROP FOREIGN KEY \`fk_order_hotel_payment1\`,
        DROP FOREIGN KEY \`fk_order_hotel_hotel_room1\`,
        DROP FOREIGN KEY \`fk_order_hotel_customer1\`;
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel_passenger\` 
        DROP FOREIGN KEY \`fk_order_hotel_passenger_order_hotel1\`;
    `);

    await queryRunner.query(`
        ALTER TABLE \`payment\` 
        DROP FOREIGN KEY \`fk_payment_customer1\`;
    `);

    await queryRunner.query(`
        ALTER TABLE \`customer\` 
        DROP COLUMN \`phone\`,
        ADD COLUMN \`age\` INT(11) NULL DEFAULT NULL AFTER \`birthday\`,
        CHANGE COLUMN \`gender\` \`gender\` ENUM('male', 'female', 'other') CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL DEFAULT 'male' AFTER \`lastName\`,
        CHANGE COLUMN \`mobile\` \`mobile\` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL ,
        CHANGE COLUMN \`email\` \`email\` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL ;
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel\` 
        DROP COLUMN \`passengersInfoUpdateDeadline\`,
        DROP COLUMN \`passengersInfoReasonRejected\`,
        DROP COLUMN \`passengersInfoStatus\`,
        DROP COLUMN \`availabilityReasonRejected\`,
        DROP COLUMN \`availabilityStatus\`,
        DROP COLUMN \`reasonRejected\`,
        DROP COLUMN \`status\`,
        DROP COLUMN \`invoiceFile\`,
        DROP COLUMN \`paymentId\`,
        DROP COLUMN \`roomId\`,
        ADD COLUMN \`invoiceId\` INT(11) NULL DEFAULT NULL AFTER \`id\`,
        CHANGE COLUMN \`tourismId\` \`tourismId\` INT(11) NULL DEFAULT NULL AFTER \`userId\`,
        CHANGE COLUMN \`customerId\` \`invoiceCustomerId\` INT(11) NULL DEFAULT NULL ,
        CHANGE COLUMN \`ticketFile\` \`voucherFile\` VARCHAR(128) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL ,
        ADD INDEX \`fk_order_hotel_invoice_customer1_idx\` (\`invoiceCustomerId\` ASC),
        ADD INDEX \`fk_order_hotel_invoice1_idx\` (\`invoiceId\` ASC),
        DROP INDEX \`fk_order_hotel_payment1_idx\` ,
        DROP INDEX \`fk_order_hotel_hotel_room1_idx\` ,
        DROP INDEX \`fk_order_hotel_customer1_idx\` ; 
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel_passenger\` 
        ADD COLUMN \`customerId\` INT(11) NULL DEFAULT NULL AFTER \`invoiceId\`,
        ADD COLUMN \`email\` VARCHAR(255) NULL DEFAULT NULL AFTER \`mobile\`,
        ADD COLUMN \`birthday\` DATE NULL DEFAULT NULL AFTER \`email\`,
        ADD COLUMN \`identityCardFile\` VARCHAR(128) NULL DEFAULT NULL AFTER \`disability\`,
        ADD COLUMN \`hasHotel\` TINYINT(4) NOT NULL DEFAULT 0 AFTER \`passportNumber\`,
        ADD COLUMN \`hasTour\` TINYINT(4) NOT NULL DEFAULT 0 AFTER \`hasHotel\`,
        ADD COLUMN \`hasEvent\` TINYINT(4) NOT NULL DEFAULT 0 AFTER \`hasTour\`,
        ADD COLUMN \`hasService\` TINYINT(4) NOT NULL DEFAULT 0 AFTER \`hasEvent\`,
        ADD COLUMN \`hasEstate\` TINYINT(4) NOT NULL DEFAULT 0 AFTER \`hasService\`,
        CHANGE COLUMN \`orderId\` \`invoiceId\` INT(11) NULL DEFAULT NULL ,
        ADD INDEX \`fk_invoice_customer_invoice1_idx\` (\`invoiceId\` ASC),
        ADD INDEX \`fk_invoice_customer_customer1_idx\` (\`customerId\` ASC),
        DROP INDEX \`fk_order_hotel_passenger_order_hotel1_idx\`;
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel_passenger\` RENAME TO  \`invoice_customer\`;
    `);

    await queryRunner.query(`
        ALTER TABLE \`payment\` 
        DROP COLUMN \`type\`,
        ADD COLUMN \`randomToken\` VARCHAR(128) NULL DEFAULT NULL AFTER \`amount\`,
        CHANGE COLUMN \`tourismId\` \`tourismId\` INT(11) NULL DEFAULT NULL AFTER \`userId\`,
        CHANGE COLUMN \`status\` \`status\` ENUM('pending', 'done', 'failed') CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL DEFAULT 'pending' AFTER \`referenceNumber\`,
        CHANGE COLUMN \`customerId\` \`invoiceCustomerId\` INT(11) NOT NULL ,
        ADD INDEX \`fk_payment_invoice_customer1_idx\` (\`invoiceCustomerId\` ASC),
        DROP INDEX \`fk_payment_customer1_idx\` ;
    `);

    await queryRunner.query(`
        ALTER TABLE \`user_wallet_history\` 
        CHANGE COLUMN \`orderAmount\` \`invoiceId\` INT(11) NULL DEFAULT NULL ,
        ADD INDEX \`fk_user_wallet_history_invoice1_idx\` (\`invoiceId\` ASC); 
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS \`invoice\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`userId\` INT(11) NOT NULL,
        \`tourismId\` INT(11) NULL DEFAULT NULL,
        \`invoiceCustomerId\` INT(11) NOT NULL,
        \`paymentId\` INT(11) NULL DEFAULT NULL,
        \`amount\` DECIMAL(10,2) NOT NULL,
        \`passengersInfoStatus\` ENUM('waiting', 'verified', 'rejected') NOT NULL DEFAULT 'waiting',
        \`passengersInfoReasonRejected\` VARCHAR(255) NULL DEFAULT NULL,
        \`passengersInfoUpdateDeadline\` DATETIME NULL DEFAULT NULL,
        \`invoiceFile\` VARCHAR(128) NULL DEFAULT NULL,
        \`status\` ENUM('pending', 'unpaid', 'rejected', 'done') NOT NULL DEFAULT 'pending',
        \`reasonRejected\` VARCHAR(255) NULL DEFAULT NULL,
        \`createdAt\` DATETIME NOT NULL,
        \`updatedAt\` DATETIME NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`fk_invoice_user1_idx\` (\`userId\` ASC),
        INDEX \`fk_invoice_tourism1_idx\` (\`tourismId\` ASC),
        INDEX \`fk_invoice_invoice_customer1_idx\` (\`invoiceCustomerId\` ASC),
        INDEX \`fk_invoice_payment1_idx\` (\`paymentId\` ASC),
        CONSTRAINT \`fk_invoice_user1\`
            FOREIGN KEY (\`userId\`)
            REFERENCES \`user\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
        CONSTRAINT \`fk_invoice_tourism1\`
            FOREIGN KEY (\`tourismId\`)
            REFERENCES \`tourism\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
        CONSTRAINT \`fk_invoice_invoice_customer1\`
            FOREIGN KEY (\`invoiceCustomerId\`)
            REFERENCES \`invoice_customer\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
        CONSTRAINT \`fk_invoice_payment1\`
            FOREIGN KEY (\`paymentId\`)
            REFERENCES \`payment\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION)
        ENGINE = InnoDB
        DEFAULT CHARACTER SET = utf8
        COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS \`order_hotel_map_room\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`orderHotelId\` INT(11) NOT NULL,
        \`hotelRoomId\` INT(11) NOT NULL,
        \`amount\` DECIMAL(10,2) NOT NULL,
        \`availabilityStatus\` ENUM('systemVerified', 'waiting', 'verified', 'rejected') NOT NULL DEFAULT 'systemVerified',
        \`availabilityReasonRejected\` VARCHAR(255) NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`fk_order_hotel_map_room_order_hotel1_idx\` (\`orderHotelId\` ASC),
        INDEX \`fk_order_hotel_map_room_hotel_room1_idx\` (\`hotelRoomId\` ASC),
        CONSTRAINT \`fk_order_hotel_map_room_order_hotel1\`
            FOREIGN KEY (\`orderHotelId\`)
            REFERENCES \`order_hotel\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
        CONSTRAINT \`fk_order_hotel_map_room_hotel_room1\`
            FOREIGN KEY (\`hotelRoomId\`)
            REFERENCES \`hotel_room\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION)
        ENGINE = InnoDB
        DEFAULT CHARACTER SET = utf8
        COLLATE = utf8_unicode_ci;
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel\` 
        ADD CONSTRAINT \`fk_order_hotel_invoice_customer1\`
        FOREIGN KEY (\`invoiceCustomerId\`)
        REFERENCES \`invoice_customer\` (\`id\`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
        ADD CONSTRAINT \`fk_order_hotel_invoice1\`
        FOREIGN KEY (\`invoiceId\`)
        REFERENCES \`invoice\` (\`id\`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
        ALTER TABLE \`payment\` 
        ADD CONSTRAINT \`fk_payment_invoice_customer1\`
        FOREIGN KEY (\`invoiceCustomerId\`)
        REFERENCES \`invoice_customer\` (\`id\`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
        ALTER TABLE \`user_wallet_history\` 
        ADD CONSTRAINT \`fk_user_wallet_history_invoice1\`
        FOREIGN KEY (\`invoiceId\`)
        REFERENCES \`invoice\` (\`id\`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
        ALTER TABLE \`invoice\` 
        DROP FOREIGN KEY \`fk_invoice_invoice_customer1\`;
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel\` 
        DROP FOREIGN KEY \`fk_order_hotel_invoice_customer1\`;
    `);

    await queryRunner.query(`
        ALTER TABLE \`payment\` 
        DROP FOREIGN KEY \`fk_payment_invoice_customer1\`;
    `);

    await queryRunner.query(`
        ALTER TABLE \`invoice\` 
        DROP COLUMN \`invoiceCustomerId\`,
        DROP INDEX \`fk_invoice_invoice_customer1_idx\` ;
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel\` 
        DROP COLUMN \`invoiceCustomerId\`,
        DROP INDEX \`fk_order_hotel_invoice_customer1_idx\` ;
    `);

    await queryRunner.query(`
        ALTER TABLE \`payment\` 
        DROP COLUMN \`invoiceCustomerId\`,
        DROP INDEX \`fk_payment_invoice_customer1_idx\` ;
    `);

    await queryRunner.query(`
        ALTER TABLE \`invoice_customer\` 
        ADD CONSTRAINT \`fk_invoice_customer_customer1\`
        FOREIGN KEY (\`customerId\`)
        REFERENCES \`customer\` (\`id\`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
        ADD CONSTRAINT \`fk_invoice_customer_invoice1\`
        FOREIGN KEY (\`invoiceId\`)
        REFERENCES \`invoice\` (\`id\`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;`);

    await queryRunner.query(`SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
