import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTourismLevelFields1674499182329
  implements MigrationInterface
{
  name = 'changeTourismLevelFields1674499182329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tourism_level\` CHANGE \`hotelCommissionPercent\` \`hotelCommissionPerPerson\` DECIMAL(10,2) NOT NULL DEFAULT '0.00', CHANGE \`tourCommissionPercent\` \`tourCommissionPerPerson\` DECIMAL(10,2) NOT NULL DEFAULT '0.00';`,
    );
    //
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
