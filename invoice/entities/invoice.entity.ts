import { OrderTourEntity } from 'src/modules/order-tour/entities/order-tour.entity';
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
import { OrderHotelEntity } from '../../order-hotel/entities/order-hotel.entity';
import { PaymentEntity } from '../../payment/entities/payment.entity';
import { TourismEntity } from '../../tourism/entities/tourism.entity';
import { UserWalletHistoryEntity } from '../../user/entities/user-wallet-history.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { InvoiceCustomerEntity } from './invoice-customer.entity';
import { TransferEntity } from '../../transfer/entities/transfer.entity';

export enum InvoicePassengersInfoStatus {
  waiting = 'waiting',
  verified = 'verified',
  rejected = 'rejected',
}

export enum InvoiceStatus {
  pending = 'pending',
  unpaid = 'unpaid',
  rejected = 'rejected',
  accepted = 'accepted',
  done = 'done',
}

export enum InvoiceStatusTranslate {
  pending = 'در حال انتظار',
  unpaid = 'پرداخت نشده',
  rejected = 'رد شده',
  done = 'پرداخت شده',
  accepted = 'تایید شده',
}

@Index('fk_invoice_user1_idx', ['userId'], {})
@Index('fk_invoice_tourism1_idx', ['tourismId'], {})
@Index('fk_invoice_payment1_idx', ['paymentId'], {})
@Entity('invoice')
export class InvoiceEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('int', { name: 'tourismId', nullable: true })
  tourismId: number | null;

  @Column('int', { name: 'paymentId', nullable: true })
  paymentId: number | null;

  @Column('varchar', {
    name: 'number',
    length: 45,
  })
  number: string;

  @Column('varchar', { name: 'tourismNumber', nullable: true, length: 45 })
  tourismNumber: string | null;

  @Column('varchar', { name: 'systemNumber', nullable: true, length: 45 })
  systemNumber: string | null;

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

  @Column('int', { name: 'transferId', nullable: true })
  transferId: number | null;

  @Column('decimal', {
    name: 'transferAmount',
    nullable: true,
    precision: 10,
    scale: 2,
    default: () => "'0.00'",
    transformer: new DecimalTransformer(),
  })
  transferAmount: number | null;

  @Column('decimal', {
    name: 'transferBuyAmount',
    nullable: true,
    precision: 10,
    scale: 2,
    default: () => "'0.00'",
    transformer: new DecimalTransformer(),
  })
  transferBuyAmount: number | null;

  @Column('decimal', {
    name: 'totalAmount',
    default: () => "'0.00'",
    nullable: true,
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  totalAmount: number | null;

  @Column('enum', {
    name: 'passengersInfoStatus',
    enum: InvoicePassengersInfoStatus,
    default: () => InvoicePassengersInfoStatus.waiting,
  })
  passengersInfoStatus: InvoicePassengersInfoStatus;

  @Column('varchar', {
    name: 'passengersInfoReasonRejected',
    nullable: true,
    length: 255,
  })
  passengersInfoReasonRejected: string | null;

  @Column('datetime', { name: 'passengersInfoUpdateDeadline', nullable: true })
  passengersInfoUpdateDeadline: Date | null;

  @Column('varchar', {
    name: 'invoiceSaleFile',
    nullable: true,
    length: 128,
  })
  invoiceSaleFile: string | null;

  @Column('varchar', {
    name: 'invoiceBuyFile',
    nullable: true,
    length: 128,
  })
  invoiceBuyFile: string | null;

  @Column('varchar', { name: 'tourTicketFile', nullable: true, length: 128 })
  tourTicketFile: string | null;

  @Column('enum', {
    name: 'status',
    enum: InvoiceStatus,
    default: () => InvoiceStatus.pending,
  })
  status: InvoiceStatus;

  @Column('varchar', { name: 'reasonRejected', nullable: true, length: 255 })
  reasonRejected: string | null;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  @Column('datetime', { name: 'updatedAt', nullable: true })
  updatedAt: Date | null;

  /**
   * Relations
   */
  @OneToMany(
    () => InvoiceCustomerEntity,
    (invoiceCustomer) => invoiceCustomer.invoice,
  )
  invoiceCustomers: InvoiceCustomerEntity[];

  @ManyToOne(() => PaymentEntity, (payment) => payment.invoices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'paymentId', referencedColumnName: 'id' }])
  payment: PaymentEntity;

  @ManyToOne(() => TourismEntity, (tourism) => tourism.invoices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourismId', referencedColumnName: 'id' }])
  tourism: TourismEntity;

  @ManyToOne(() => UserEntity, (user) => user.invoices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;

  @OneToMany(() => OrderHotelEntity, (orderHotel) => orderHotel.invoice)
  orderHotels: OrderHotelEntity[];

  @OneToMany(() => OrderTourEntity, (orderTour) => orderTour.invoice)
  orderTours: OrderTourEntity[];

  @OneToMany(
    () => UserWalletHistoryEntity,
    (userWalletHistory) => userWalletHistory.invoice,
  )
  userWalletHistories: UserWalletHistoryEntity[];

  @ManyToOne(() => TransferEntity, (transfer) => transfer.invoices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'transferId', referencedColumnName: 'id' }])
  transfer: TransferEntity;
}
