import { MigrationInterface, QueryRunner } from 'typeorm';

export class notificationTable1677098632295 implements MigrationInterface {
  name = 'notificationTable1677098632295';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`notification\` (
            \`id\` INT(11) NOT NULL AUTO_INCREMENT,
            \`tourismId\` INT(11) NULL DEFAULT NULL,
            \`type\` ENUM('invoice', 'payment', 'withdraw') NOT NULL DEFAULT 'invoice',
            \`sourceId\` INT(11) NULL DEFAULT NULL,
            \`message\` VARCHAR(255) NOT NULL,
            \`isReaded\` TINYINT(4) NOT NULL DEFAULT 0,
            \`createdAt\` DATETIME NOT NULL,
            PRIMARY KEY (\`id\`),
            INDEX \`fk_notification_tourism1_idx\` (\`tourismId\` ASC),
            CONSTRAINT \`fk_notification_tourism1\`
              FOREIGN KEY (\`tourismId\`)
              REFERENCES \`tourism\` (\`id\`)
              ON DELETE NO ACTION
              ON UPDATE NO ACTION)
          ENGINE = InnoDB
          DEFAULT CHARACTER SET = utf8
          COLLATE = utf8_unicode_ci`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
