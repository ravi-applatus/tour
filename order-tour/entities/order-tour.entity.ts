import { InvoiceEntity } from 'src/modules/invoice/entities/invoice.entity';
import { TourEntity } from 'src/modules/tour/entities/tour.entity';
import { TourismEntity } from 'src/modules/tourism/entities/tourism.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DecimalTransformer } from 'src/utils/transformers/DecimalTransformer';
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
import { InvoiceCustomerEntity } from '../../invoice/entities/invoice-customer.entity';
import { OrderTourMapFeatureEntity } from './order-tour-map-feature.entity';

@Index('fk_order_tour_invoice1_idx', ['invoiceId'], {})
@Index('fk_order_tour_tour1_idx', ['tourId'], {})
@Index('fk_order_tour_tourism1_idx', ['tourismId'], {})
@Index('fk_order_tour_user1_idx', ['userId'], {})
@Entity('order_tour')
export class OrderTourEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'tourId' })
  tourId: number;

  @Column('int', { name: 'invoiceId', nullable: true })
  invoiceId: number | null;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('int', { name: 'tourismId', nullable: true })
  tourismId: number | null;

  @Column('decimal', {
    name: 'price',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  price: number;

  @Column('decimal', {
    name: 'buyPrice',
    default: () => "'0.00'",
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  buyPrice: number;

  @Column('int', { name: 'countCustomer' })
  countCustomer: number;

  @Column('decimal', {
    name: 'amount',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  amount: number;

  @Column('decimal', {
    name: 'buyAmount',
    default: () => "'0.00'",
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  buyAmount: number;

  @Column('decimal', {
    name: 'commission',
    precision: 10,
    scale: 2,
    default: () => "'0'",
    transformer: new DecimalTransformer(),
  })
  commission: number;

  @Column('varchar', { name: 'description', nullable: true, length: 225 })
  description: string | null;

  @Column('varchar', {
    name: 'voucherPassengerFile',
    nullable: true,
    length: 128,
  })
  voucherPassengerFile: string | null;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  @Column('datetime', { name: 'updatedAt', nullable: true })
  updatedAt: Date | null;

  /**
   * Relations
   */
  @OneToMany(
    () => InvoiceCustomerEntity,
    (invoiceCustomer) => invoiceCustomer.orderTour,
  )
  invoiceCustomers: InvoiceCustomerEntity[];

  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.orderTours, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'invoiceId', referencedColumnName: 'id' }])
  invoice: InvoiceEntity;

  @OneToMany(
    () => OrderTourMapFeatureEntity,
    (orderTourMapFeature) => orderTourMapFeature.orderTour,
  )
  orderTourMapFeatures: OrderTourMapFeatureEntity[];

  @ManyToOne(() => TourEntity, (tour) => tour.orders, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourId', referencedColumnName: 'id' }])
  tour: TourEntity;

  @ManyToOne(() => TourismEntity, (tourism) => tourism.orderTours, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourismId', referencedColumnName: 'id' }])
  tourism: TourismEntity;

  @ManyToOne(() => UserEntity, (user) => user.orderTours, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;
}
