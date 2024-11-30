import { HotelRoomPriceEntity } from 'src/modules/hotel-room/entities/hotel-room-price.entity';
import { TourPriceEntity } from 'src/modules/tour/entities/tour-price.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';
import { HotelLevelOfferEntity } from '../../hotel-offer/entities/hotel-level-offer.entity';
import { SliderEntity } from '../../slider/entities/slider.entity';
import { TourismEntity } from './tourism.entity';

export enum TourismLevelIds {
  base = 1,
}

@Entity('tourism_level')
export class TourismLevelEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 45 })
  name: string;

  @Column('decimal', {
    name: 'hotelCommissionPerPerson',
    precision: 10,
    scale: 2,
    default: () => "'0.00'",
    transformer: new DecimalTransformer(),
  })
  hotelCommissionPerPerson: number;

  @Column('decimal', {
    name: 'tourCommissionPerPerson',
    precision: 10,
    scale: 2,
    default: () => "'0.00'",
    transformer: new DecimalTransformer(),
  })
  tourCommissionPerPerson: number;

  /**
   * Relations
   */
  @OneToMany(
    () => HotelLevelOfferEntity,
    (hotelLevelOffer) => hotelLevelOffer.level,
  )
  hotelLevelOffers: HotelLevelOfferEntity[];

  @OneToMany(
    () => HotelRoomPriceEntity,
    (hotelRoomPrice) => hotelRoomPrice.level,
  )
  hotelRoomPrices: HotelRoomPriceEntity[];

  @OneToMany(() => TourPriceEntity, (tourPrice) => tourPrice.level)
  tourPrices: TourPriceEntity[];

  @OneToMany(() => TourismEntity, (tourism) => tourism.level)
  tourisms: TourismEntity[];

  @OneToMany(() => SliderEntity, (slider) => slider.level)
  sliders: SliderEntity[];
}
