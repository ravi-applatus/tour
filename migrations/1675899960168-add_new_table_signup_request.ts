import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewTableSignupRequest1675899960168
  implements MigrationInterface
{
  name = 'addNewTableSignupRequest1675899960168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`signup_request\` ( \`id\` INT NOT NULL AUTO_INCREMENT , \`tourismName\` VARCHAR(128) NOT NULL , \`adminName\` VARCHAR(128) NOT NULL , \`phone\` VARCHAR(45) NOT NULL , \`email\` VARCHAR(255) NOT NULL , \`address\` VARCHAR(255) NOT NULL , \`status\` ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending' , \`adminComment\` VARCHAR(255) NULL , \`createdAt\` DATETIME NOT NULL , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
