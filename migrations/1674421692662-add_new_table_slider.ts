import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewTableSlider1674421692662 implements MigrationInterface {
  name = 'addNewTableSlider1674421692662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`slider\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`levelId\` INT(11) NULL DEFAULT NULL,
  \`from\` DATETIME NULL DEFAULT NULL,
  \`to\` DATETIME NULL DEFAULT NULL,
  \`pathFile\` VARCHAR(128) NOT NULL,
  \`isActive\` TINYINT(4) NOT NULL DEFAULT 1,
  \`createdAt\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_slider_tourism_level_idx\` (\`levelId\` ASC),
  CONSTRAINT \`fk_slider_tourism_level\`
    FOREIGN KEY (\`levelId\`)
    REFERENCES \`tourism_level\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
