import { OrderHotelMapRoomEntity } from 'src/modules/order-hotel/entities/order-hotel-map-room.entity';
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
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { OrderTourEntity } from '../../order-tour/entities/order-tour.entity';
import { InvoiceEntity } from './invoice.entity';

export enum CustomerGenders {
  male = 'male',
  female = 'female',
  other = 'other',
}

export enum CustomerGendersTranslate {
  male = 'Mr',
  female = 'Mrs',
  other = '',
}

@Index('fk_invoice_customer_invoice1_idx', ['invoiceId'], {})
@Index('fk_invoice_customer_customer1_idx', ['customerId'], {})
@Entity('invoice_customer')
export class InvoiceCustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'invoiceId', nullable: true })
  invoiceId: number | null;

  @Column('int', { name: 'customerId', nullable: true })
  customerId: number | null;

  @Column('int', { name: 'orderRoomId', nullable: true })
  orderRoomId: number | null;

  @Column('int', { name: 'orderTourId', nullable: true })
  orderTourId: number | null;

  @Column('varchar', { name: 'firstName', length: 45 })
  firstName: string;

  @Column('varchar', { name: 'lastName', length: 45 })
  lastName: string;

  @Column('enum', {
    name: 'gender',
    enum: CustomerGenders,
    default: () => CustomerGenders.male,
  })
  gender: CustomerGenders;

  @Column('varchar', { name: 'mobile', nullable: true, length: 45 })
  mobile: string | null;

  @Column('varchar', { name: 'email', nullable: true, length: 255 })
  email: string | null;

  @Column('date', { name: 'birthday', nullable: true })
  birthday: string | null;

  @Column('int', { name: 'age', nullable: true })
  age: number | null;

  @Column('varchar', { name: 'disability', nullable: true, length: 128 })
  disability: string | null;

  @Column('varchar', { name: 'identityCardFile', nullable: true, length: 128 })
  identityCardFile: string | null;

  @Column('varchar', { name: 'identityCardNumber', nullable: true, length: 45 })
  identityCardNumber: string | null;

  @Column('varchar', { name: 'passportFile', nullable: true, length: 128 })
  passportFile: string | null;

  @Column('varchar', { name: 'passportNumber', nullable: true, length: 45 })
  passportNumber: string | null;

  @Column('tinyint', {
    name: 'isLeader',
    default: () => "'1'",
    transformer: new BooleanTransformer(),
  })
  isLeader: boolean;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  /**
   * Relations
   */
  @ManyToOne(() => CustomerEntity, (customer) => customer.invoiceCustomers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'customerId', referencedColumnName: 'id' }])
  customer: CustomerEntity;

  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.invoiceCustomers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'invoiceId', referencedColumnName: 'id' }])
  invoice: InvoiceEntity;

  @ManyToOne(
    () => OrderHotelMapRoomEntity,
    (orderHotelMapRoom) => orderHotelMapRoom.invoiceCustomers,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'orderRoomId', referencedColumnName: 'id' }])
  orderRoom: OrderHotelMapRoomEntity;

  @ManyToOne(() => OrderTourEntity, (orderTour) => orderTour.invoiceCustomers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'orderTourId', referencedColumnName: 'id' }])
  orderTour: OrderTourEntity;
}
