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
import { UserEntity } from '../../user/entities/user.entity';

export enum CustomerGenders {
  male = 'male',
  female = 'female',
  other = 'other',
}

@Index('fk_customer_user1_idx', ['userId'], {})
@Entity('customer')
export class CustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

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

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  /**
   * Relations
   */
  @ManyToOne(() => UserEntity, (user) => user.customers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;

  @OneToMany(
    () => InvoiceCustomerEntity,
    (invoiceCustomer) => invoiceCustomer.customer,
  )
  invoiceCustomers: InvoiceCustomerEntity[];
}
