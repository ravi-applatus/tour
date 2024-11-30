import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TourPriceEntity } from './tour-price.entity';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';

@Index('fk_tour_child_price_tour_price1_idx', ['tourPriceId'], {})
@Entity('tour_child_price')
export class TourChildPriceEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'tourPriceId' })
  tourPriceId: number;

  @Column('int', { name: 'ageFrom' })
  ageFrom: number;

  @Column('int', { name: 'ageTo' })
  ageTo: number;

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

  /**
   * Relations
   */
  @ManyToOne(() => TourPriceEntity, (tourPrice) => tourPrice.childPrices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourPriceId', referencedColumnName: 'id' }])
  tourPrice: TourPriceEntity;
}
