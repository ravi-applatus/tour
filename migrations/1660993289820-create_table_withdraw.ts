import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableWithdraw1660993289820 implements MigrationInterface {
  name = 'createTableWithdraw1660993289820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`withdraw\` (
        \`id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`userId\` INT(11) NOT NULL,
        \`tourismId\` INT(11) NULL DEFAULT NULL,
        \`amount\` DECIMAL(10,2) NOT NULL,
        \`status\` ENUM('pending', 'done', 'rejected') NOT NULL DEFAULT 'pending',
        \`reasonRejected\` VARCHAR(256) NULL DEFAULT NULL,
        \`createdAt\` DATE NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`fk_withdraw_user1_idx\` (\`userId\` ASC),
        INDEX \`fk_withdraw_tourism1_idx\` (\`tourismId\` ASC),
        CONSTRAINT \`fk_withdraw_user1\`
            FOREIGN KEY (\`userId\`)
            REFERENCES \`user\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
        CONSTRAINT \`fk_withdraw_tourism1\`
            FOREIGN KEY (\`tourismId\`)
            REFERENCES \`tourism\` (\`id\`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION)
        ENGINE = InnoDB
        DEFAULT CHARACTER SET = utf8
        COLLATE = utf8_unicode_ci;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
