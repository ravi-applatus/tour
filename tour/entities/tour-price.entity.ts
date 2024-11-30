import { TourismLevelEntity } from 'src/modules/tourism/entities/tourism-level.entity';
import { DecimalTransformer } from 'src/utils/transformers/DecimalTransformer';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TourEntity } from './tour.entity';
import { TourChildPriceEntity } from './tour-child-price.entity';

@Index('fk_tour_price_tour1_idx', ['tourId'], {})
@Index('fk_tour_price_tourism_level1_idx', ['levelId'], {})
@Entity('tour_price')
export class TourPriceEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'levelId' })
  levelId: number;

  @Column('int', { name: 'tourId' })
  tourId: number;

  @Column('decimal', {
    name: 'price',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  price: number;

  @Column('decimal', {
    name: 'buyPrice',
    precision: 10,
    scale: 2,
    default: () => '0.00',
    transformer: new DecimalTransformer(),
  })
  buyPrice: number;

  /**
   * Relations
   */
  @ManyToOne(() => TourEntity, (tour) => tour.prices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourId', referencedColumnName: 'id' }])
  tour: TourEntity;

  @ManyToOne(
    () => TourismLevelEntity,
    (tourismLevel) => tourismLevel.tourPrices,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'levelId', referencedColumnName: 'id' }])
  level: TourismLevelEntity;

  @OneToMany(
    () => TourChildPriceEntity,
    (tourChildPrice) => tourChildPrice.tourPrice,
  )
  childPrices: TourChildPriceEntity[];
}
