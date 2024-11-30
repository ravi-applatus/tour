import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldsInOrderTourTable1665773406872
  implements MigrationInterface
{
  name = 'addFieldsInOrderTourTable1665773406872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tour\` 
ADD COLUMN \`price\` DECIMAL(10,2) NOT NULL AFTER \`tourismId\`,
ADD COLUMN \`countCustomer\` INT(11) NOT NULL AFTER \`price\`,
ADD INDEX \`fk_order_tour_tour1_idx\` (\`tourId\` ASC)`,
    );

    await queryRunner.query(
      `ALTER TABLE \`order_tour\` 
ADD CONSTRAINT \`fk_order_tour_tour1\`
  FOREIGN KEY (\`tourId\`)
  REFERENCES \`tour\` (\`id\`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
