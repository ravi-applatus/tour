import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BooleanTransformer } from '../../../utils/transformers/BooleanTransformer';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';
import { HotelFeatureEntity } from './hotel-feature.entity';
import { HotelEntity } from './hotel.entity';

@Index('fk_hotel_map_feature_hotel1_idx', ['hotelId'], {})
@Index('fk_hotel_map_feature_hotel_feature1_idx', ['hotelFeatureId'], {})
@Entity('hotel_map_feature')
export class HotelMapFeatureEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'hotelFeatureId' })
  hotelFeatureId: number;

  @Column('int', { name: 'hotelId' })
  hotelId: number;

  @Column('tinyint', {
    name: 'isOptional',
    default: () => "'0'",
    transformer: new BooleanTransformer(),
  })
  isOptional: boolean;

  @Column('decimal', {
    name: 'price',
    nullable: true,
    precision: 10,
    scale: 2,
    default: () => "'0.00'",
    transformer: new DecimalTransformer(),
  })
  price: number | null;

  /**
   * Relations
   */
  @ManyToOne(() => HotelEntity, (hotel) => hotel.hotelMapFeatures, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'hotelId', referencedColumnName: 'id' }])
  hotel: HotelEntity;

  @ManyToOne(
    () => HotelFeatureEntity,
    (hotelFeature) => hotelFeature.hotelMapFeatures,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'hotelFeatureId', referencedColumnName: 'id' }])
  hotelFeature: HotelFeatureEntity;
}
