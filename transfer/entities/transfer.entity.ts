import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BooleanTransformer } from '../../../utils/transformers/BooleanTransformer';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';
import { InvoiceEntity } from '../../invoice/entities/invoice.entity';

@Entity('transfer')
export class TransferEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 128 })
  name: string;

  @Column('decimal', {
    name: 'price',
    precision: 10,
    scale: 2,
    default: () => "'0.00'",

    transformer: new DecimalTransformer(),
  })
  price: number;

  @Column('decimal', {
    name: 'buyPrice',
    precision: 10,
    scale: 2,
    default: () => "'0.00'",

    transformer: new DecimalTransformer(),
  })
  buyPrice: number;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('tinyint', {
    name: 'isActive',
    width: 1,
    default: () => "'1'",
    transformer: new BooleanTransformer(),
  })
  isActive: boolean;

  /**
   * Relations
   */
  @OneToMany(() => InvoiceEntity, (invoice) => invoice.transfer)
  invoices: InvoiceEntity[];
}
