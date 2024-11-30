import { TourFeatureEntity } from 'src/modules/tour/entities/tour-feature.entity';
import { DecimalTransformer } from 'src/utils/transformers/DecimalTransformer';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderTourEntity } from './order-tour.entity';

@Index('fk_order_tour_map_feature_order_tour1_idx', ['orderTourId'], {})
@Index('fk_order_tour_map_feature_tour_feature1_idx', ['tourFeatureId'], {})
@Entity('order_tour_map_feature')
export class OrderTourMapFeatureEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'orderTourId' })
  orderTourId: number;

  @Column('int', { name: 'tourFeatureId' })
  tourFeatureId: number;

  @Column('decimal', {
    name: 'price',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  price: number;

  /**
   * Relations
   */
  @ManyToOne(
    () => OrderTourEntity,
    (orderTour) => orderTour.orderTourMapFeatures,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'orderTourId', referencedColumnName: 'id' }])
  orderTour: OrderTourEntity;

  @ManyToOne(
    () => TourFeatureEntity,
    (tourFeature) => tourFeature.orderTourMapFeatures,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'tourFeatureId', referencedColumnName: 'id' }])
  tourFeature: TourFeatureEntity;
}
