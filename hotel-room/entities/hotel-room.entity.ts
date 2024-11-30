import { HotelEntity } from 'src/modules/hotel/entities/hotel.entity';
import { BooleanTransformer } from 'src/utils/transformers/BooleanTransformer';
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
import { OrderHotelMapRoomEntity } from '../../order-hotel/entities/order-hotel-map-room.entity';
import { HotelRoomAvailabilityEntity } from './hotel-room-availability.entity';
import { HotelRoomPriceEntity } from './hotel-room-price.entity';

@Index('fk_hotel_room_hotel1_idx', ['hotelId'], {})
@Entity('hotel_room')
export class HotelRoomEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'hotelId' })
  hotelId: number;

  @Column('varchar', { name: 'name', length: 128 })
  name: string;

  @Column('varchar', { name: 'type', nullable: true, length: 128 })
  type: string | null;

  @Column('int', { name: 'maxCapacity', default: () => "'0'" })
  maxCapacity: number;

  @Column('int', { name: 'maxExtraCapacity', default: () => "'0'" })
  maxExtraCapacity: number;

  @Column('tinyint', {
    name: 'isActive',
    default: () => "'1'",
    transformer: new BooleanTransformer(),
  })
  isActive: boolean;

  /**
   * Relations
   */
  @ManyToOne(() => HotelEntity, (hotel) => hotel.rooms, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'hotelId', referencedColumnName: 'id' }])
  hotel: HotelEntity;

  @OneToMany(
    () => HotelRoomPriceEntity,
    (hotelRoomPrice) => hotelRoomPrice.room,
  )
  prices: HotelRoomPriceEntity[];

  @OneToMany(
    () => OrderHotelMapRoomEntity,
    (orderHotelMapRoom) => orderHotelMapRoom.hotelRoom,
  )
  orderHotelMapRooms: OrderHotelMapRoomEntity[];

  @OneToMany(
    () => HotelRoomAvailabilityEntity,
    (hotelRoomAvailability) => hotelRoomAvailability.room,
  )
  availabilities: HotelRoomAvailabilityEntity[];
}
