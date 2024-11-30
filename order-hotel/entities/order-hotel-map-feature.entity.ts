import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';
import { HotelFeatureEntity } from '../../hotel/entities/hotel-feature.entity';
import { OrderHotelEntity } from './order-hotel.entity';

@Index('fk_order_hotel_map_feature_order_hotel1_idx', ['orderHotelId'], {})
@Index('fk_order_hotel_map_feature_hotel_feature1_idx', ['hotelFetureId'], {})
@Entity('order_hotel_map_feature')
export class OrderHotelMapFeatureEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'orderHotelId' })
  orderHotelId: number;

  @Column('int', { name: 'hotelFetureId' })
  hotelFetureId: number;

  @Column('decimal', {
    name: 'price',
    precision: 10,
    scale: 2,
    default: () => "'0.00'",
    transformer: new DecimalTransformer(),
  })
  price: number;

  /**
   * Relations
   */
  @ManyToOne(
    () => HotelFeatureEntity,
    (hotelFeature) => hotelFeature.orderHotelMapFeatures,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'hotelFetureId', referencedColumnName: 'id' }])
  hotelFeature: HotelFeatureEntity;

  @ManyToOne(
    () => OrderHotelEntity,
    (orderHotel) => orderHotel.orderHotelMapFeatures,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'orderHotelId', referencedColumnName: 'id' }])
  orderHotel: OrderHotelEntity;
}
