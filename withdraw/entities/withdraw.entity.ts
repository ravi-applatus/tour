import { TourismEntity } from 'src/modules/tourism/entities/tourism.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { BooleanTransformer } from 'src/utils/transformers/BooleanTransformer';
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

export enum WithdrawStatus {
  pending = 'pending',
  done = 'done',
  rejected = 'rejected',
}

@Index('fk_withdraw_user1_idx', ['userId'], {})
@Index('fk_withdraw_tourism1_idx', ['tourismId'], {})
@Entity('withdraw')
export class WithdrawEntity extends BaseEntity {
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

  @Column('tinyint', {
    name: 'rialRequest',
    default: () => "'0'",
    transformer: new BooleanTransformer(),
  })
  rialRequest: boolean;

  @Column('enum', {
    name: 'status',
    enum: WithdrawStatus,
    default: () => WithdrawStatus.pending,
  })
  status: WithdrawStatus;

  @Column('varchar', { name: 'reasonRejected', nullable: true, length: 256 })
  reasonRejected: string | null;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  /**
   * Relations
   */
  @ManyToOne(() => TourismEntity, (tourism) => tourism.withdraws, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourismId', referencedColumnName: 'id' }])
  tourism: TourismEntity;

  @ManyToOne(() => UserEntity, (user) => user.withdraws, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;
}
