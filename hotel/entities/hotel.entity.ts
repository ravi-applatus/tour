import { HotelRoomEntity } from 'src/modules/hotel-room/entities/hotel-room.entity';
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
import { HotelLevelOfferEntity } from '../../hotel-offer/entities/hotel-level-offer.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { HotelImageEntity } from './hotel-image.entity';
import { HotelMapFeatureEntity } from './hotel-map-feature.entity';
import { HotelVideoEntity } from './hotel-video.entity';

export enum HotelStatus {
  new = 'new',
  updated = 'updated',
  verified = 'verified',
  rejected = 'rejected',
  inactive = 'inactive',
}

@Index('fk_hotel_hotel_image1_idx', ['coverId'], {})
@Index('fk_hotel_user1_idx', ['userId'], {})
@Entity('hotel')
export class HotelEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('varchar', { name: 'name', length: 45 })
  name: string;

  @Column('varchar', { name: 'code', nullable: true, length: 45 })
  code: string;

  @Column('varchar', { name: 'star', nullable: true, length: 45 })
  star: string | null;

  @Column('varchar', { name: 'phone', nullable: true, length: 45 })
  phone: string | null;

  @Column('varchar', { name: 'email', nullable: true, length: 255 })
  email: string | null;

  @Column('varchar', { name: 'managerName', nullable: true, length: 128 })
  managerName: string | null;

  @Column('varchar', { name: 'address', length: 255 })
  address: string;

  @Column('varchar', { name: 'locationLat', length: 45, nullable: true })
  locationLat: string | null;

  @Column('varchar', { name: 'locationLng', length: 45, nullable: true })
  locationLng: string | null;

  @Column('varchar', { name: 'country', length: 45 })
  country: string;

  @Column('varchar', { name: 'state', length: 45 })
  state: string;

  @Column('varchar', { name: 'city', length: 45 })
  city: string;

  @Column('int', { name: 'coverId', nullable: true })
  coverId: number | null;

  @Column('tinyint', {
    name: 'needOrderConfirmAvailability',
    default: () => "'0'",
    transformer: new BooleanTransformer(),
  })
  needOrderConfirmAvailability: boolean;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  @Column('datetime', { name: 'updatedAt', nullable: true })
  updatedAt: Date | null;

  @Column('enum', {
    name: 'status',
    enum: HotelStatus,
    default: () => HotelStatus.new,
  })
  status: HotelStatus;

  @Column('varchar', { name: 'reasonRejected', nullable: true, length: 255 })
  reasonRejected: string | null;

  /**
   * Relations
   */
  @ManyToOne(() => HotelImageEntity, (hotelImage) => hotelImage.hotels, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'coverId', referencedColumnName: 'id' }])
  cover: HotelImageEntity;

  @OneToMany(() => HotelImageEntity, (hotelImage) => hotelImage.hotel)
  images: HotelImageEntity[];

  @OneToMany(
    () => HotelLevelOfferEntity,
    (hotelLevelOffer) => hotelLevelOffer.hotel,
  )
  hotelLevelOffers: HotelLevelOfferEntity[];

  @OneToMany(
    () => HotelMapFeatureEntity,
    (hotelMapFeature) => hotelMapFeature.hotel,
  )
  hotelMapFeatures: HotelMapFeatureEntity[];

  @OneToMany(() => HotelRoomEntity, (hotelRoom) => hotelRoom.hotel)
  rooms: HotelRoomEntity[];

  @ManyToOne(() => UserEntity, (user) => user.hotels, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;

  @OneToMany(() => HotelVideoEntity, (hotelVideo) => hotelVideo.hotel)
  videos: HotelVideoEntity[];
}
