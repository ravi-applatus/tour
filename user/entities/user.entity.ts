import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { TourismEntity } from 'src/modules/tourism/entities/tourism.entity';
import {
  AfterLoad,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { HotelEntity } from '../../hotel/entities/hotel.entity';
import { UserWalletHistoryEntity } from './user-wallet-history.entity';
import { WithdrawEntity } from 'src/modules/withdraw/entities/withdraw.entity';
import { PaymentEntity } from '../../payment/entities/payment.entity';
import { InvoiceEntity } from '../../invoice/entities/invoice.entity';
import { OrderHotelEntity } from '../../order-hotel/entities/order-hotel.entity';
import { DecimalTransformer } from '../../../utils/transformers/DecimalTransformer';
import { TourEntity } from 'src/modules/tour/entities/tour.entity';
import { OrderTourEntity } from 'src/modules/order-tour/entities/order-tour.entity';

export enum UserStatus {
  active = 'active',
  inactive = 'inactive',
  banned = 'banned',
}

@Entity('user')
@Index('fk_user_role_idx', ['roleId'], {})
@Index('fk_user_tourism1_idx', ['tourismId'], {})
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'firstName', length: 45 })
  firstName: string;

  @Column('varchar', { name: 'lastName', length: 45 })
  lastName: string;

  @Column('varchar', { name: 'email', unique: true, length: 255 })
  email: string;

  @Column('varchar', {
    name: 'mobile',
    nullable: true,
    unique: true,
    length: 45,
  })
  mobile: string | null;

  @Column('varchar', { name: 'password', length: 128 })
  password: string;

  @Column('int', { name: 'roleId' })
  roleId: number;

  @Column('int', { name: 'tourismId', nullable: true })
  tourismId: number | null;

  @Column('decimal', {
    name: 'wallet',
    precision: 10,
    scale: 2,
    default: () => '0.00',
    transformer: new DecimalTransformer(),
  })
  wallet: number;

  @Column('varchar', { name: 'identityCardFile', nullable: true, length: 128 })
  identityCardFile: string | null;

  @Column('varchar', { name: 'identityCardNumber', nullable: true, length: 45 })
  identityCardNumber: string | null;

  @Column('varchar', { name: 'ibanDollar', nullable: true, length: 128 })
  ibanDollar: string | null;

  @Column('varchar', { name: 'ibanRial', nullable: true, length: 128 })
  ibanRial: string | null;

  @Column('varchar', { name: 'randomHash', nullable: true, length: 128 })
  randomHash: string | null;

  @Column('datetime', { name: 'expireRandomHash', nullable: true })
  expireRandomHash: Date | null;

  @Column('enum', {
    name: 'status',
    enum: UserStatus,
    default: () => UserStatus.active,
  })
  status: UserStatus;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  /**
   * Relations
   */
  @ManyToOne(() => RoleEntity, (role) => role.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'roleId', referencedColumnName: 'id' }])
  role: RoleEntity;

  @OneToMany(() => CustomerEntity, (customer) => customer.user)
  customers: CustomerEntity[];

  @OneToMany(() => HotelEntity, (hotel) => hotel.user)
  hotels: HotelEntity[];

  @OneToMany(() => OrderHotelEntity, (orderHotel) => orderHotel.user)
  orderHotels: OrderHotelEntity[];

  @OneToMany(() => OrderTourEntity, (orderTour) => orderTour.user)
  orderTours: OrderTourEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments: PaymentEntity[];

  @OneToMany(() => TourEntity, (tour) => tour.user)
  tours: TourEntity[];

  @OneToMany(() => TourismEntity, (tourism) => tourism.admin)
  tourismManagers: TourismEntity[];

  @OneToMany(() => TourismEntity, (tourism) => tourism.marketer)
  tourismMarketers: TourismEntity[];

  @ManyToOne(() => TourismEntity, (tourism) => tourism.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourismId', referencedColumnName: 'id' }])
  tourism: TourismEntity;

  @OneToMany(
    () => UserWalletHistoryEntity,
    (userWalletHistory) => userWalletHistory.user,
  )
  userWalletHistories: UserWalletHistoryEntity[];

  @OneToMany(() => WithdrawEntity, (withdraw) => withdraw.user)
  withdraws: WithdrawEntity[];

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.user)
  invoices: InvoiceEntity[];

  /**
   * Entity Listeners
   * https://typeorm.io/listeners-and-subscribers
   */
  public previousPassword: string;

  @AfterLoad()
  public loadPreviousPassword() {
    this.previousPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  /**
   * Helpers
   */
  async isCorrectSaltPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }
}
