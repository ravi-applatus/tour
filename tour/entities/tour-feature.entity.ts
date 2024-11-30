import { OrderTourMapFeatureEntity } from 'src/modules/order-tour/entities/order-tour-map-feature.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TourMapFeatureEntity } from './tour-map-feature.entity';

@Entity('tour_feature')
export class TourFeatureEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'title', length: 45 })
  title: string;

  @Column('varchar', { name: 'icon', nullable: true, length: 128 })
  icon: string | null;

  /**
   * Relations
   */
  @OneToMany(
    () => OrderTourMapFeatureEntity,
    (orderTourMapFeature) => orderTourMapFeature.tourFeature,
  )
  orderTourMapFeatures: OrderTourMapFeatureEntity[];

  @OneToMany(
    () => TourMapFeatureEntity,
    (tourMapFeature) => tourMapFeature.tourFeature,
  )
  tourMapFeatures: TourMapFeatureEntity[];
}
