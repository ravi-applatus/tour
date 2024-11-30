import { TourismLevelEntity } from 'src/modules/tourism/entities/tourism-level.entity';
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
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';
import { HotelRoomEntity } from './hotel-room.entity';
import { HotelRoomChildPriceEntity } from './hotel-room-child-price.entity';

@Index('fk_hotel_room_price_hotel_room1_idx', ['roomId'], {})
@Index('fk_hotel_room_price_tourism_level1', ['levelId'], {})
@Entity('hotel_room_price')
export class HotelRoomPriceEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'levelId' })
  levelId: number;

  @Column('int', { name: 'roomId' })
  roomId: number;

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

  @Column('decimal', {
    name: 'childExtraBuyPrice',
    precision: 10,
    scale: 2,
    default: () => '0.00',
    transformer: new DecimalTransformer(),
  })
  childExtraBuyPrice: number;

  @Column('decimal', {
    name: 'childExtraPrice',
    precision: 10,
    scale: 2,
    default: () => '0.00',
    transformer: new DecimalTransformer(),
  })
  childExtraPrice: number;

  @Column('date', { name: 'from', nullable: true })
  from: string | null;

  @Column('date', { name: 'to', nullable: true })
  to: string | null;

  /**
   * Relations
   */
  @ManyToOne(() => HotelRoomEntity, (hotelRoom) => hotelRoom.prices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'roomId', referencedColumnName: 'id' }])
  room: HotelRoomEntity;

  @ManyToOne(
    () => TourismLevelEntity,
    (tourismLevel) => tourismLevel.hotelRoomPrices,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'levelId', referencedColumnName: 'id' }])
  level: TourismLevelEntity;

  @OneToMany(
    () => HotelRoomChildPriceEntity,
    (hotelRoomChildPrice) => hotelRoomChildPrice.roomPrice,
  )
  childPrices: HotelRoomChildPriceEntity[];
}
