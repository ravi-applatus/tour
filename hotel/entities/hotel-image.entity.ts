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
import { HotelEntity } from './hotel.entity';

@Index('fk_hotel_image_hotel1_idx', ['hotelId'], {})
@Entity('hotel_image')
export class HotelImageEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'hotelId' })
  hotelId: number;

  @Column('varchar', { name: 'pathFile', length: 128 })
  pathFile: string;

  //relations
  @OneToMany(() => HotelEntity, (hotel) => hotel.cover)
  hotels: HotelEntity[];

  @ManyToOne(() => HotelEntity, (hotel) => hotel.images, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'hotelId', referencedColumnName: 'id' }])
  hotel: HotelEntity;
}
