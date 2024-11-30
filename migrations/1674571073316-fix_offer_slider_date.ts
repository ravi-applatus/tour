import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixOfferSliderDate1674571073316 implements MigrationInterface {
  name = 'fixOfferSliderDate1674571073316';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`slider\` CHANGE \`from\` \`from\` DATE NULL DEFAULT NULL, CHANGE \`to\` \`to\` DATE NULL DEFAULT NULL;`,
    );

    await queryRunner.query(
      `ALTER TABLE \`hotel_level_offer\` CHANGE \`from\` \`from\` DATE NULL DEFAULT NULL, CHANGE \`to\` \`to\` DATE NULL DEFAULT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
