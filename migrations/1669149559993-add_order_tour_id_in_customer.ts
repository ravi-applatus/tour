import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOrderTourIdInCustomer1669149559993
  implements MigrationInterface
{
  name = 'addOrderTourIdInCustomer1669149559993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`invoice_customer\` 
        DROP COLUMN \`hasEstate\`,
        DROP COLUMN \`hasService\`,
        DROP COLUMN \`hasEvent\`,
        DROP COLUMN \`hasTour\`,
        DROP COLUMN \`hasHotel\`,
        ADD COLUMN \`orderTourId\` INT(11) NULL DEFAULT NULL AFTER \`orderRoomId\`,
        ADD INDEX \`fk_invoice_customer_order_tour1_idx\` (\`orderTourId\` ASC)`);

    await queryRunner.query(`ALTER TABLE \`invoice_customer\` 
    ADD CONSTRAINT \`fk_invoice_customer_order_tour1\`
      FOREIGN KEY (\`orderTourId\`)
      REFERENCES \`order_tour\` (\`id\`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
