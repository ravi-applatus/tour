import { OrderTourEntity } from 'src/modules/order-tour/entities/order-tour.entity';
import { UserWalletHistoryEntity } from 'src/modules/user/entities/user-wallet-history.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { WithdrawEntity } from 'src/modules/withdraw/entities/withdraw.entity';
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
import { NotificationEntity } from '../../notification/entities/notification.entity';
import { OrderHotelEntity } from '../../order-hotel/entities/order-hotel.entity';
import { PaymentEntity } from '../../payment/entities/payment.entity';
import { TourismLevelEntity } from './tourism-level.entity';

export enum TourismStatus {
  new = 'new',
  updated = 'updated',
  verified = 'verified',
  rejected = 'rejected',
  inactive = 'inactive',
}

@Index('fk_tourism_tourism_level1_idx', ['levelId'], {})
@Index('fk_tourism_user1_idx', ['adminId'], {})
@Index('fk_tourism_user2_idx', ['marketerId'], {})
@Entity('tourism')
export class TourismEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 45 })
  name: string;

  @Column('varchar', { name: 'code', nullable: true, length: 45 })
  code: string;

  @Column('int', { name: 'adminId', nullable: true })
  adminId: number | null;

  @Column('int', { name: 'marketerId', nullable: true })
  marketerId: number | null;

  @Column('int', { name: 'levelId' })
  levelId: number;

  @Column('varchar', { name: 'licenseFile', length: 128 })
  licenseFile: string;

  @Column('varchar', { name: 'address', length: 128 })
  address: string;

  @Column('varchar', { name: 'phone', nullable: true, length: 45 })
  phone: string | null;

  @Column('enum', {
    name: 'status',
    enum: TourismStatus,
    default: () => TourismStatus.new,
  })
  status: TourismStatus;

  @Column('varchar', { name: 'reasonRejected', nullable: true, length: 255 })
  reasonRejected: string | null;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  @Column('datetime', { name: 'updatedAt', nullable: true })
  updatedAt: Date | null;

  /**
   * Relations
   */
  @OneToMany(() => OrderHotelEntity, (orderHotel) => orderHotel.tourism)
  orderHotels: OrderHotelEntity[];

  @OneToMany(() => OrderTourEntity, (orderTour) => orderTour.tourism)
  orderTours: OrderTourEntity[];

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.tourism)
  invoices: InvoiceEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.tourism)
  payments: PaymentEntity[];

  @ManyToOne(
    () => TourismLevelEntity,
    (tourismLevel) => tourismLevel.tourisms,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'levelId', referencedColumnName: 'id' }])
  level: TourismLevelEntity;

  @ManyToOne(() => UserEntity, (user) => user.tourismManagers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'adminId', referencedColumnName: 'id' }])
  admin: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.tourismMarketers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'marketerId', referencedColumnName: 'id' }])
  marketer: UserEntity;

  @OneToMany(() => UserEntity, (user) => user.tourism)
  users: UserEntity[];

  @OneToMany(
    () => UserWalletHistoryEntity,
    (userWalletHistory) => userWalletHistory.tourism,
  )
  userWalletHistories: UserWalletHistoryEntity[];

  @OneToMany(() => WithdrawEntity, (withdraw) => withdraw.tourism)
  withdraws: WithdrawEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.tourism)
  notifications: NotificationEntity[];
}
