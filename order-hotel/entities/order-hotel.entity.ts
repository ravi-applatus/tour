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
import { InvoiceEntity } from '../../invoice/entities/invoice.entity';
import { TourismEntity } from '../../tourism/entities/tourism.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { OrderHotelMapFeatureEntity } from './order-hotel-map-feature.entity';
import { OrderHotelMapRoomEntity } from './order-hotel-map-room.entity';

@Index('fk_order_hotel_user1_idx', ['userId'], {})
@Index('fk_order_hotel_tourism1_idx', ['tourismId'], {})
@Index('fk_order_hotel_invoice1_idx', ['invoiceId'], {})
@Entity('order_hotel')
export class OrderHotelEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'number', nullable: true, length: 45 })
  number: string;

  @Column('int', { name: 'invoiceId', nullable: true })
  invoiceId: number | null;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('int', { name: 'tourismId', nullable: true })
  tourismId: number | null;

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
    name: 'discountAmount',
    default: () => "'0.00'",
    nullable: true,
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  discountAmount: number | null;

  @Column('decimal', {
    name: 'totalAmount',
    default: () => "'0.00'",
    nullable: true,
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  totalAmount: number | null;

  @Column('date', { name: 'checkIn' })
  checkIn: string;

  @Column('date', { name: 'checkOut' })
  checkOut: string;

  @Column('varchar', { name: 'description', nullable: true, length: 255 })
  description: string | null;

  @Column('varchar', { name: 'arrivalAirline', nullable: true, length: 45 })
  arrivalAirline: string | null;

  @Column('varchar', { name: 'departureAirline', nullable: true, length: 45 })
  departureAirline: string | null;

  @Column('datetime', { name: 'arrivalDate', nullable: true })
  arrivalDate: Date | null;

  @Column('varchar', { name: 'arrivalNumber', nullable: true, length: 45 })
  arrivalNumber: string | null;

  @Column('datetime', { name: 'departureDate', nullable: true })
  departureDate: Date | null;

  @Column('varchar', { name: 'departureNumber', nullable: true, length: 45 })
  departureNumber: string | null;

  @Column('varchar', {
    name: 'voucherReserveFile',
    nullable: true,
    length: 128,
  })
  voucherReserveFile: string | null;

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
  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.orderHotels, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'invoiceId', referencedColumnName: 'id' }])
  invoice: InvoiceEntity;

  @OneToMany(
    () => OrderHotelMapRoomEntity,
    (orderHotelMapRoom) => orderHotelMapRoom.orderHotel,
  )
  orderHotelMapRooms: OrderHotelMapRoomEntity[];

  @ManyToOne(() => TourismEntity, (tourism) => tourism.orderHotels, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourismId', referencedColumnName: 'id' }])
  tourism: TourismEntity;

  @ManyToOne(() => UserEntity, (user) => user.orderHotels, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;

  @OneToMany(
    () => OrderHotelMapFeatureEntity,
    (orderHotelMapFeature) => orderHotelMapFeature.orderHotel,
  )
  orderHotelMapFeatures: OrderHotelMapFeatureEntity[];
}
