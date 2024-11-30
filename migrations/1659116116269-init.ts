import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1659116116269 implements MigrationInterface {
  name = 'init1659116116269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;`,
    );
    await queryRunner.query(
      `SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;`,
    );

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`customer\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`userId\` int(11) NOT NULL,
  \`firstName\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`lastName\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`mobile\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`email\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`identityCardFile\` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`identityCardNumber\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`createdAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_customer_user1_idx\` (\`userId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`userId\` int(11) NOT NULL,
  \`name\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`star\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`address\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`country\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`city\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`coverId\` int(11) DEFAULT NULL,
  \`createdAt\` datetime NOT NULL,
  \`isActive\` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`),
  KEY \`fk_hotel_hotel_image1_idx\` (\`coverId\`),
  KEY \`fk_hotel_user1_idx\` (\`userId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_feature\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`title\` varchar(45) NOT NULL,
  \`icon\` varchar(128) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_image\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`hotelId\` int(11) NOT NULL,
  \`pathFile\` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_hotel_image_hotel1_idx\` (\`hotelId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_level_offer\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`levelId\` int(11) NOT NULL,
  \`reserveFrom\` datetime NOT NULL,
  \`reserveTo\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_hotel_level_offer_tourism_level1_idx\` (\`levelId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_map_feature\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`hotelFeatureId\` int(11) NOT NULL,
  \`hotelId\` int(11) NOT NULL,
  \`isOptional\` tinyint(4) NOT NULL DEFAULT '0',
  \`price\` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (\`id\`),
  KEY \`fk_hotel_map_feature_hotel1_idx\` (\`hotelId\`),
  KEY \`fk_hotel_map_feature_hotel_feature1_idx\` (\`hotelFeatureId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_offer\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`levelOfferId\` int(11) NOT NULL,
  \`hotelId\` int(11) NOT NULL,
  \`roomLimitCount\` int(11) NOT NULL,
  \`roomReservedCount\` int(11) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_hotel_level_offer_hotel1_idx\` (\`hotelId\`),
  KEY \`fk_hotel_map_level_hotel_level_offer1_idx\` (\`levelOfferId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_room\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`hotelId\` int(11) NOT NULL,
  \`name\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`bedCount\` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (\`id\`),
  KEY \`fk_hotel_room_hotel1_idx\` (\`hotelId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`hotel_room_price\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`levelId\` int(11) NOT NULL,
  \`roomId\` int(11) NOT NULL,
  \`price\` int(11) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_hotel_room_price_hotel_room1_idx\` (\`roomId\`),
  KEY \`fk_hotel_room_price_tourism_level1\` (\`levelId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`order_hotel\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`userId\` int(11) NOT NULL,
  \`customerId\` int(11) NOT NULL,
  \`tourismId\` int(11) DEFAULT NULL,
  \`roomId\` int(11) NOT NULL,
  \`paymentId\` int(11) DEFAULT NULL,
  \`ticketFile\` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`amount\` decimal(10,2) NOT NULL,
  \`status\` enum('pending','accepted','rejected','done') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'pending',
  \`reasonRejected\` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`createdAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_order_hotel_user1_idx\` (\`userId\`),
  KEY \`fk_order_hotel_customer1_idx\` (\`customerId\`),
  KEY \`fk_order_hotel_tourism1_idx\` (\`tourismId\`),
  KEY \`fk_order_hotel_hotel_room1_idx\` (\`roomId\`),
  KEY \`fk_order_hotel_payment1_idx\` (\`paymentId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`order_hotel_passenger\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`orderId\` int(11) NOT NULL,
  \`firstName\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`lastName\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`gender\` enum('male','female','other') COLLATE utf8_unicode_ci NOT NULL,
  \`mobile\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`identityCardNumber\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`isSupervisor\` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (\`id\`),
  KEY \`fk_order_hotel_passenger_order_hotel1_idx\` (\`orderId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`payment\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`userId\` int(11) NOT NULL,
  \`customerId\` int(11) NOT NULL,
  \`tourismId\` int(11) DEFAULT NULL,
  \`amount\` decimal(10,0) NOT NULL,
  \`type\` enum('hotel','tour','event','service','estate') COLLATE utf8_unicode_ci NOT NULL,
  \`status\` enum('pending','done','failed') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'pending',
  \`createdAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_payment_user1_idx\` (\`userId\`),
  KEY \`fk_payment_customer1_idx\` (\`customerId\`),
  KEY \`fk_payment_tourism1_idx\` (\`tourismId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`permission\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`description\` varchar(256) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`type\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`role\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`lock\` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`role_map_permission\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`roleId\` int(11) NOT NULL,
  \`permissionId\` int(11) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_role_permission_role1_idx\` (\`roleId\`),
  KEY \`fk_role_permission_permission1_idx\` (\`permissionId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`tourism\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`adminId\` int(11) DEFAULT NULL,
  \`marketerId\` int(11) DEFAULT NULL,
  \`levelId\` int(11) NOT NULL,
  \`isActive\` tinyint(4) NOT NULL DEFAULT '0',
  \`createdAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_tourism_user1_idx\` (\`adminId\`),
  KEY \`fk_tourism_tourism_level1_idx\` (\`levelId\`),
  KEY \`fk_tourism_user2_idx\` (\`marketerId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`tourism_level\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`hotelCommissionPercent\` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`user\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`firstName\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`lastName\` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  \`email\` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  \`mobile\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`password\` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  \`roleId\` int(11) NOT NULL,
  \`tourismId\` int(11) DEFAULT NULL,
  \`walletUSD\` decimal(10,2) NOT NULL DEFAULT '0.00',
  \`walletEUR\` decimal(10,2) NOT NULL DEFAULT '0.00',
  \`identityCardFile\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`identityCardNumber\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`randomHash\` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  \`expireRandomHash\` datetime DEFAULT NULL,
  \`status\` enum('active','inactive','banned') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'active',
  \`createdAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`email_UNIQUE\` (\`email\`),
  UNIQUE KEY \`mobile_UNIQUE\` (\`mobile\`),
  KEY \`fk_user_role_idx\` (\`roleId\`),
  KEY \`fk_user_tourism1_idx\` (\`tourismId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`user_wallet_history\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`userId\` int(11) NOT NULL,
  \`tourismId\` int(11) DEFAULT NULL,
  \`amount\` decimal(10,2) NOT NULL,
  \`orderAmount\` decimal(10,2) NOT NULL,
  \`currency\` enum('USD','EUR') NOT NULL DEFAULT 'USD',
  \`type\` enum('commission','withdrawal') NOT NULL,
  \`createdAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_wallet_user_user1_idx\` (\`userId\`),
  KEY \`fk_wallet_user_tourism1_idx\` (\`tourismId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);

    await queryRunner.query(`ALTER TABLE \`customer\`
  ADD CONSTRAINT \`fk_customer_user1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`hotel\`
  ADD CONSTRAINT \`fk_hotel_hotel_image1\` FOREIGN KEY (\`coverId\`) REFERENCES \`hotel_image\` (\`id\`),
  ADD CONSTRAINT \`fk_hotel_user1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`hotel_image\`
  ADD CONSTRAINT \`fk_hotel_image_hotel1\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`hotel_level_offer\`
  ADD CONSTRAINT \`fk_hotel_level_offer_tourism_level1\` FOREIGN KEY (\`levelId\`) REFERENCES \`tourism_level\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`hotel_map_feature\`
  ADD CONSTRAINT \`fk_hotel_map_feature_hotel1\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\` (\`id\`),
  ADD CONSTRAINT \`fk_hotel_map_feature_hotel_feature1\` FOREIGN KEY (\`hotelFeatureId\`) REFERENCES \`hotel_feature\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`hotel_offer\`
  ADD CONSTRAINT \`fk_hotel_level_offer_hotel1\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\` (\`id\`),
  ADD CONSTRAINT \`fk_hotel_map_level_hotel_level_offer1\` FOREIGN KEY (\`levelOfferId\`) REFERENCES \`hotel_level_offer\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`hotel_room\`
  ADD CONSTRAINT \`fk_hotel_room_hotel1\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotel\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`hotel_room_price\`
  ADD CONSTRAINT \`fk_hotel_room_price_hotel_room1\` FOREIGN KEY (\`roomId\`) REFERENCES \`hotel_room\` (\`id\`),
  ADD CONSTRAINT \`fk_hotel_room_price_tourism_level1\` FOREIGN KEY (\`levelId\`) REFERENCES \`tourism_level\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`order_hotel\`
  ADD CONSTRAINT \`fk_order_hotel_customer1\` FOREIGN KEY (\`customerId\`) REFERENCES \`customer\` (\`id\`),
  ADD CONSTRAINT \`fk_order_hotel_hotel_room1\` FOREIGN KEY (\`roomId\`) REFERENCES \`hotel_room\` (\`id\`),
  ADD CONSTRAINT \`fk_order_hotel_payment1\` FOREIGN KEY (\`paymentId\`) REFERENCES \`payment\` (\`id\`),
  ADD CONSTRAINT \`fk_order_hotel_tourism1\` FOREIGN KEY (\`tourismId\`) REFERENCES \`tourism\` (\`id\`),
  ADD CONSTRAINT \`fk_order_hotel_user1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`order_hotel_passenger\`
  ADD CONSTRAINT \`fk_order_hotel_passenger_order_hotel1\` FOREIGN KEY (\`orderId\`) REFERENCES \`order_hotel\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`payment\`
  ADD CONSTRAINT \`fk_payment_customer1\` FOREIGN KEY (\`customerId\`) REFERENCES \`customer\` (\`id\`),
  ADD CONSTRAINT \`fk_payment_tourism1\` FOREIGN KEY (\`tourismId\`) REFERENCES \`tourism\` (\`id\`),
  ADD CONSTRAINT \`fk_payment_user1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`role_map_permission\`
  ADD CONSTRAINT \`fk_role_permission_permission1\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\` (\`id\`),
  ADD CONSTRAINT \`fk_role_permission_role1\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`tourism\`
  ADD CONSTRAINT \`fk_tourism_tourism_level1\` FOREIGN KEY (\`levelId\`) REFERENCES \`tourism_level\` (\`id\`),
  ADD CONSTRAINT \`fk_tourism_user1\` FOREIGN KEY (\`adminId\`) REFERENCES \`user\` (\`id\`),
  ADD CONSTRAINT \`fk_tourism_user2\` FOREIGN KEY (\`marketerId\`) REFERENCES \`user\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`user\`
  ADD CONSTRAINT \`fk_user_role\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\` (\`id\`),
  ADD CONSTRAINT \`fk_user_tourism1\` FOREIGN KEY (\`tourismId\`) REFERENCES \`tourism\` (\`id\`);`);

    await queryRunner.query(`ALTER TABLE \`user_wallet_history\`
  ADD CONSTRAINT \`fk_wallet_user_tourism1\` FOREIGN KEY (\`tourismId\`) REFERENCES \`tourism\` (\`id\`),
  ADD CONSTRAINT \`fk_wallet_user_user1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`);`);

    await queryRunner.query(`SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;`);

    await queryRunner.query(`SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
