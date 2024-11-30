import { MigrationInterface, QueryRunner } from 'typeorm';

export class deleteFieldChildPricePercentFromHotelTable1668346000072
  implements MigrationInterface
{
  name = 'deleteFieldChildPricePercentFromHotelTable1668346000072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `\ALTER TABLE \`hotel\` DROP \`childPricePercent\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
