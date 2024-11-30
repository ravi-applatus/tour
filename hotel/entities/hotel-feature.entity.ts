import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderHotelMapFeatureEntity } from '../../order-hotel/entities/order-hotel-map-feature.entity';
import { HotelMapFeatureEntity } from './hotel-map-feature.entity';

@Entity('hotel_feature')
export class HotelFeatureEntity extends BaseEntity {
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
    () => HotelMapFeatureEntity,
    (hotelMapFeature) => hotelMapFeature.hotelFeature,
  )
  hotelMapFeatures: HotelMapFeatureEntity[];

  @OneToMany(
    () => OrderHotelMapFeatureEntity,
    (orderHotelMapFeature) => orderHotelMapFeature.hotelFeature,
  )
  orderHotelMapFeatures: OrderHotelMapFeatureEntity[];
}
