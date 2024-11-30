import { BooleanTransformer } from 'src/utils/transformers/BooleanTransformer';
import { DecimalTransformer } from 'src/utils/transformers/DecimalTransformer';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HotelEntity } from '../../hotel/entities/hotel.entity';
import { TourismLevelEntity } from '../../tourism/entities/tourism-level.entity';

@Index('fk_hotel_level_offer_hotel1_idx', ['hotelId'], {})
@Index('fk_hotel_level_offer_tourism_level1_idx', ['levelId'], {})
@Entity('hotel_level_offer')
export class HotelLevelOfferEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'levelId', nullable: true })
  levelId: number | null;

  @Column('int', { name: 'hotelId' })
  hotelId: number;

  @Column('date', { name: 'from', nullable: true })
  from: string | null;

  @Column('date', { name: 'to', nullable: true })
  to: string | null;

  @Column('decimal', {
    name: 'discount',
    default: () => "'0.00'",
    nullable: true,
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  discount: number | null;

  @Column('tinyint', {
    name: 'isActive',
    default: () => '1',
    transformer: new BooleanTransformer(),
  })
  isActive: boolean;

  /**
   * Relations
   */
  @ManyToOne(() => HotelEntity, (hotel) => hotel.hotelLevelOffers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'hotelId', referencedColumnName: 'id' }])
  hotel: HotelEntity;

  @ManyToOne(
    () => TourismLevelEntity,
    (tourismLevel) => tourismLevel.hotelLevelOffers,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'levelId', referencedColumnName: 'id' }])
  level: TourismLevelEntity;
}
