import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewCommissionFieldsInTourTable1684783387901
  implements MigrationInterface
{
  name = 'addNewCommissionFieldsInTourTable1684783387901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tour\` ADD \`commissionPerPerson\` DECIMAL(10,2) NOT NULL DEFAULT '0' 
      AFTER \`reservedCount\`, ADD \`percentageCommission\` 
      DECIMAL(10,2) NOT NULL DEFAULT '0' AFTER \`commissionPerPerson\`;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
