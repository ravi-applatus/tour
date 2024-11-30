import { OrderTourEntity } from 'src/modules/order-tour/entities/order-tour.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
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
import { TourImageEntity } from './tour-image.entity';
import { TourMapFeatureEntity } from './tour-map-feature.entity';
import { TourPriceEntity } from './tour-price.entity';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';

export enum TourStatus {
  new = 'new',
  updated = 'updated',
  verified = 'verified',
  rejected = 'rejected',
  inactive = 'inactive',
}

@Index('fk_tour_tour_image1_idx', ['coverId'], {})
@Index('fk_tour_user1_idx', ['userId'], {})
@Entity('tour')
export class TourEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('int', { name: 'coverId', nullable: true })
  coverId: number | null;

  @Column('varchar', { name: 'name', length: 45 })
  name: string;

  @Column('varchar', { name: 'managerName', nullable: true, length: 128 })
  managerName: string | null;

  @Column('varchar', { name: 'phone', nullable: true, length: 45 })
  phone: string | null;

  @Column('varchar', { name: 'destinationCity', length: 45 })
  destinationCity: string;

  @Column('varchar', { name: 'destinationCountry', length: 45 })
  destinationCountry: string;

  @Column('varchar', { name: 'transportType', nullable: true, length: 45 })
  transportType: string | null;

  @Column('varchar', { name: 'brochureFile', nullable: true, length: 128 })
  brochureFile: string | null;

  @Column('int', { name: 'reservedCount', default: () => "'0'" })
  reservedCount: number;

  @Column('decimal', {
    name: 'commissionPerPerson',
    precision: 10,
    scale: 2,
    default: () => "'0'",
    transformer: new DecimalTransformer(),
  })
  commissionPerPerson: number;

  @Column('decimal', {
    name: 'percentageCommission',
    precision: 10,
    scale: 2,
    default: () => "'0'",
    transformer: new DecimalTransformer(),
  })
  percentageCommission: number;

  @Column('enum', {
    name: 'status',
    enum: TourStatus,
    default: () => TourStatus.new,
  })
  status: TourStatus;

  @Column('varchar', { name: 'reasonRejected', nullable: true, length: 225 })
  reasonRejected: string | null;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  @Column('datetime', { name: 'updatedAt', nullable: true })
  updatedAt: Date | null;

  /**
   * Relations
   */
  @OneToMany(
    () => TourMapFeatureEntity,
    (tourMapFeature) => tourMapFeature.tour,
  )
  tourMapFeatures: TourMapFeatureEntity[];

  @OneToMany(() => TourPriceEntity, (tourPrice) => tourPrice.tour)
  prices: TourPriceEntity[];

  @OneToMany(() => TourImageEntity, (tourImage) => tourImage.tour)
  images: TourImageEntity[];

  @ManyToOne(() => TourImageEntity, (tourImage) => tourImage.tours, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'coverId', referencedColumnName: 'id' }])
  cover: TourImageEntity;

  @ManyToOne(() => UserEntity, (user) => user.tours, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;

  @OneToMany(() => OrderTourEntity, (orderTour) => orderTour.tour)
  orders: OrderTourEntity[];
}
