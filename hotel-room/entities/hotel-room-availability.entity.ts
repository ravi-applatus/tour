import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HotelRoomEntity } from './hotel-room.entity';

@Index('fk_hotel_room_availability_hotel_room1_idx', ['roomId'], {})
@Entity('hotel_room_availability')
export class HotelRoomAvailabilityEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'roomId' })
  roomId: number;

  @Column('int', { name: 'availabilityCount', default: () => "'0'" })
  availabilityCount: number;

  @Column('int', { name: 'reservedCount', default: () => "'0'" })
  reservedCount: number;

  @Column('date', { name: 'date' })
  date: string;

  /**
   * Relations
   */
  @ManyToOne(() => HotelRoomEntity, (hotelRoom) => hotelRoom.availabilities, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'roomId', referencedColumnName: 'id' }])
  room: HotelRoomEntity;
}
