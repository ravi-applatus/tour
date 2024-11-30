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
import { TourismEntity } from '../../tourism/entities/tourism.entity';

export enum NotificationTypes {
  invoice = 'invoice',
  payment = 'payment',
  withdraw = 'withdraw',
  signupRequest = 'signup_request',
}

@Index('fk_notification_tourism1_idx', ['tourismId'], {})
@Entity('notification')
export class NotificationEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'tourismId', nullable: true })
  tourismId: number | null;

  @Column('enum', {
    name: 'type',
    enum: NotificationTypes,
    default: () => NotificationTypes.invoice,
  })
  type: NotificationTypes;

  @Column('int', { name: 'sourceId', nullable: true })
  sourceId: number | null;

  @Column('varchar', { name: 'message', length: 255 })
  message: string;

  @Column('tinyint', {
    name: 'isReaded',
    default: () => "'0'",
    transformer: new BooleanTransformer(),
  })
  isReaded: boolean;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  /**
   * Relations
   */
  @ManyToOne(() => TourismEntity, (tourism) => tourism.notifications, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourismId', referencedColumnName: 'id' }])
  tourism: TourismEntity;
}
