import { BooleanTransformer } from 'src/utils/transformers/BooleanTransformer';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';

@Entity('currency')
export class CurrencyEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 45 })
  name: string;

  @Column('varchar', { name: 'code', length: 45 })
  code: string;

  @Column('decimal', {
    name: 'exchange',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  exchange: number;

  @Column('int', { name: 'exchangeIRR', default: () => "'0'" })
  exchangeIRR: number;

  @Column('tinyint', {
    name: 'lock',
    default: () => '0',
    transformer: new BooleanTransformer(),
  })
  lock: boolean;

  @Column('tinyint', {
    name: 'isActive',
    default: () => "'1'",
    transformer: new BooleanTransformer(),
  })
  isActive: boolean;
}
