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
import { TourFeatureEntity } from './tour-feature.entity';
import { TourEntity } from './tour.entity';

@Index('fk_tour_map_feature_tour1_idx', ['tourId'], {})
@Index('fk_tour_map_feature_tour_feature1_idx', ['tourFeatureId'], {})
@Entity('tour_map_feature')
export class TourMapFeatureEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'tourFeatureId' })
  tourFeatureId: number;

  @Column('int', { name: 'tourId' })
  tourId: number;

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
  @ManyToOne(() => TourEntity, (tour) => tour.tourMapFeatures, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourId', referencedColumnName: 'id' }])
  tour: TourEntity;

  @ManyToOne(
    () => TourFeatureEntity,
    (tourFeature) => tourFeature.tourMapFeatures,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'tourFeatureId', referencedColumnName: 'id' }])
  tourFeature: TourFeatureEntity;
}
