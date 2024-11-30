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
import { TourismLevelEntity } from '../../tourism/entities/tourism-level.entity';

@Index('fk_slider_tourism_level_idx', ['levelId'], {})
@Entity('slider')
export class SliderEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'levelId', nullable: true })
  levelId: number | null;

  @Column('date', { name: 'from', nullable: true })
  from: string | null;

  @Column('date', { name: 'to', nullable: true })
  to: string | null;

  @Column('varchar', { name: 'pathFile', length: 128 })
  pathFile: string;

  @Column('tinyint', {
    name: 'isActive',
    default: () => '1',
    transformer: new BooleanTransformer(),
  })
  isActive: boolean;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;

  /**
   * Relations
   */
  @ManyToOne(() => TourismLevelEntity, (tourismLevel) => tourismLevel.sliders, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'levelId', referencedColumnName: 'id' }])
  level: TourismLevelEntity;
}
