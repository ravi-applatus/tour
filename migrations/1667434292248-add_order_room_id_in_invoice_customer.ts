import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOrderRoomIdInInvoiceCustomer1667434292248
  implements MigrationInterface
{
  name = 'addOrderRoomIdInInvoiceCustomer1667434292248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_customer\` 
ADD COLUMN \`orderRoomId\` INT(11) NULL DEFAULT NULL AFTER \`customerId\`,
ADD INDEX \`fk_invoice_customer_order_hotel_map_room1_idx\` (\`orderRoomId\` ASC)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_customer\` 
ADD CONSTRAINT \`fk_invoice_customer_order_hotel_map_room1\`
  FOREIGN KEY (\`orderRoomId\`)
  REFERENCES \`order_hotel_map_room\` (\`id\`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
