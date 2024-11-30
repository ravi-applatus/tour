import { MigrationInterface, QueryRunner } from 'typeorm';

export class currencyExchangeIrr1677094427135 implements MigrationInterface {
  name = 'currencyExchangeIrr1677094427135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`currency\` ADD \`exchangeIRR\` INT NOT NULL DEFAULT '0' AFTER \`exchange\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`setting\` ADD \`currencySource\` ENUM('liqotrip','ragaex') NOT NULL DEFAULT 'liqotrip' AFTER \`adminEmail\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
