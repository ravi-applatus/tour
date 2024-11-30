import { InvoiceCustomerEntity } from 'src/modules/invoice/entities/invoice-customer.entity';
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
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';
import { HotelRoomEntity } from '../../hotel-room/entities/hotel-room.entity';
import { OrderHotelEntity } from './order-hotel.entity';

export enum AvailabilityStatus {
  systemVerified = 'systemVerified',
  waiting = 'waiting',
  verified = 'verified',
  rejected = 'rejected',
}
@Index('fk_order_hotel_map_room_order_hotel1_idx', ['orderHotelId'], {})
@Index('fk_order_hotel_map_room_hotel_room1_idx', ['hotelRoomId'], {})
@Entity('order_hotel_map_room')
export class OrderHotelMapRoomEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'orderHotelId' })
  orderHotelId: number;

  @Column('int', { name: 'hotelRoomId' })
  hotelRoomId: number;

  @Column('decimal', {
    name: 'amount',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  amount: number;

  @Column('decimal', {
    name: 'buyAmount',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  buyAmount: number;

  @Column('int', { name: 'quantity', default: () => "'1'" })
  quantity: number;

  @Column('enum', {
    name: 'availabilityStatus',
    enum: AvailabilityStatus,
    default: () => AvailabilityStatus.systemVerified,
  })
  availabilityStatus: AvailabilityStatus;

  @Column('varchar', {
    name: 'availabilityReasonRejected',
    nullable: true,
    length: 255,
  })
  availabilityReasonRejected: string | null;

  /**
   * Relations
   */
  @OneToMany(
    () => InvoiceCustomerEntity,
    (invoiceCustomer) => invoiceCustomer.orderRoom,
  )
  invoiceCustomers: InvoiceCustomerEntity[];

  @ManyToOne(
    () => HotelRoomEntity,
    (hotelRoom) => hotelRoom.orderHotelMapRooms,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'hotelRoomId', referencedColumnName: 'id' }])
  hotelRoom: HotelRoomEntity;

  @ManyToOne(
    () => OrderHotelEntity,
    (orderHotel) => orderHotel.orderHotelMapRooms,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'orderHotelId', referencedColumnName: 'id' }])
  orderHotel: OrderHotelEntity;
}
