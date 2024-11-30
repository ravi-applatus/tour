import { TourismEntity } from 'src/modules/tourism/entities/tourism.entity';
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
import { InvoiceEntity } from '../../invoice/entities/invoice.entity';
import { UserEntity } from './user.entity';

export enum WalletType {
  commission = 'commission',
  withdraw = 'withdraw',
}

@Index('fk_wallet_user_user1_idx', ['userId'], {})
@Index('fk_wallet_user_tourism1_idx', ['tourismId'], {})
@Entity('user_wallet_history')
export class UserWalletHistoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

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

  @Column('int', { name: 'invoiceId', nullable: true })
  invoiceId: number | null;

  @Column('enum', { name: 'type', enum: WalletType })
  type: WalletType;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  /**
   * Relations
   */
  @ManyToOne(() => TourismEntity, (tourism) => tourism.userWalletHistories, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourismId', referencedColumnName: 'id' }])
  tourism: TourismEntity;

  @ManyToOne(() => UserEntity, (user) => user.userWalletHistories, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;

  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.userWalletHistories, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'invoiceId', referencedColumnName: 'id' }])
  invoice: InvoiceEntity;
}
