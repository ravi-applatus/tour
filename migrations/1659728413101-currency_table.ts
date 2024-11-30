import { MigrationInterface, QueryRunner } from 'typeorm';

export class currencyTable1659728413101 implements MigrationInterface {
  name = 'currencyTable1659728413101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`hotel\` 
        ADD COLUMN \`needOrderConfirm\` TINYINT(4) NOT NULL DEFAULT 0 AFTER \`isActive\`,
        CHANGE COLUMN \`isActive\` \`isActive\` TINYINT(4) NOT NULL DEFAULT '0' AFTER \`coverId\`
    `);

    await queryRunner.query(`
        ALTER TABLE \`hotel_room\` 
        ADD COLUMN \`isActive\` TINYINT(4) NOT NULL DEFAULT 1 AFTER \`bedCount\`
    `);

    await queryRunner.query(`
        ALTER TABLE \`order_hotel\` 
        ADD COLUMN \`reservedDate\` DATE NOT NULL AFTER \`amount\`,
        ADD COLUMN \`reservedCountDay\` INT(11) NOT NULL AFTER \`reservedDate\`
    `);

    await queryRunner.query(`
        ALTER TABLE \`user\` 
        DROP COLUMN \`walletEUR\`,
        CHANGE COLUMN \`walletUSD\` \`wallet\` DECIMAL(10,2) NOT NULL DEFAULT '0.00' 
    `);

    await queryRunner.query(`
        ALTER TABLE \`user_wallet_history\` 
        DROP COLUMN \`currency\`
    `);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`currency\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(45) NOT NULL,
  \`code\` VARCHAR(45) NOT NULL,
  \`exchange\` DECIMAL(10,2) NOT NULL,
  \`lock\` TINYINT(4) NOT NULL DEFAULT 0,
  \`status\` TINYINT(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
