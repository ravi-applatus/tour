import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNewTable1667251118690 implements MigrationInterface {
  name = 'createNewTable1667251118690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`hotel_video\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`hotelId\` INT(11) NOT NULL,
  \`pathFile\` VARCHAR(128) NOT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_hotel_video_hotel1_idx\` (\`hotelId\` ASC),
  CONSTRAINT \`fk_hotel_video_hotel1\`
    FOREIGN KEY (\`hotelId\`)
    REFERENCES \`hotel\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
