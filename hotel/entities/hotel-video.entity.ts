import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HotelEntity } from './hotel.entity';

@Index('fk_hotel_video_hotel1_idx', ['hotelId'], {})
@Entity('hotel_video')
export class HotelVideoEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'hotelId' })
  hotelId: number;

  @Column('varchar', { name: 'pathFile', length: 128 })
  pathFile: string;

  @ManyToOne(() => HotelEntity, (hotel) => hotel.videos, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'hotelId', referencedColumnName: 'id' }])
  hotel: HotelEntity;
}
