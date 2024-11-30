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
import { InvoiceEntity } from '../../invoice/entities/invoice.entity';
import { TourismEntity } from '../../tourism/entities/tourism.entity';
import { UserEntity } from '../../user/entities/user.entity';

export enum PaymentStatus {
  pending = 'pending',
  failed = 'failed',
  done = 'done',
  rejected = 'rejected',
}

export enum PaymentMethod {
  online = 'online',
  transfer = 'transfer',
}

@Index('fk_payment_user1_idx', ['userId'], {})
@Index('fk_payment_tourism1_idx', ['tourismId'], {})
@Entity('payment')
export class PaymentEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('int', { name: 'tourismId', nullable: true })
  tourismId: number | null;

  @Column('decimal', {
    name: 'amount',
    precision: 10,
    scale: 0,
    transformer: new DecimalTransformer(),
  })
  amount: number;

  @Column('varchar', { name: 'randomToken', nullable: true, length: 128 })
  randomToken: string | null;

  @Column('varchar', { name: 'message', nullable: true, length: 255 })
  message: string | null;

  @Column('varchar', { name: 'referenceNumber', nullable: true, length: 128 })
  referenceNumber: string | null;

  @Column('varchar', { name: 'transferFile', nullable: true, length: 128 })
  transferFile: string | null;

  @Column('text', { name: 'transferDescription', nullable: true })
  transferDescription: string | null;

  @Column('enum', {
    name: 'method',
    enum: PaymentMethod,
    default: () => PaymentMethod.online,
  })
  method: PaymentMethod;

  @Column('enum', {
    name: 'status',
    enum: PaymentStatus,
    default: () => PaymentStatus.pending,
  })
  status: PaymentStatus;

  @Column('text', { name: 'reasonRejected', nullable: true })
  reasonRejected: string | null;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  /**
   * Relations
   */
  @OneToMany(() => InvoiceEntity, (invoice) => invoice.payment)
  invoices: InvoiceEntity[];

  @ManyToOne(() => TourismEntity, (tourism) => tourism.payments, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourismId', referencedColumnName: 'id' }])
  tourism: TourismEntity;

  @ManyToOne(() => UserEntity, (user) => user.payments, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;
}
