import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HotelRoomPriceEntity } from './hotel-room-price.entity';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';

@Index('fk_hotel_room_child_price_hotel_room_price1_idx', ['roomPriceId'], {})
@Entity('hotel_room_child_price')
export class HotelRoomChildPriceEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'roomPriceId' })
  roomPriceId: number;

  @Column('int', { name: 'ageFrom' })
  ageFrom: number;

  @Column('int', { name: 'ageTo' })
  ageTo: number;

  @Column('decimal', {
    name: 'price',
    precision: 10,
    scale: 2,
    default: () => '0.00',
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
  @ManyToOne(
    () => HotelRoomPriceEntity,
    (hotelRoomPrice) => hotelRoomPrice.childPrices,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'roomPriceId', referencedColumnName: 'id' }])
  roomPrice: HotelRoomPriceEntity;
}
