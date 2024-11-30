import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTourismFieldType1674939861839 implements MigrationInterface {
  name = 'changeTourismFieldType1674939861839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice\` CHANGE \`tourismNumber\` \`tourismNumber\` VARCHAR(45) NULL DEFAULT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
