import { MigrationInterface, QueryRunner } from 'typeorm';

export class hotelOfferLevelOptional1662221670221
  implements MigrationInterface
{
  name = 'hotelOfferLevelOptional1662221670221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`hotel_level_offer\` CHANGE \`levelId\` \`levelId\` INT(11) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
