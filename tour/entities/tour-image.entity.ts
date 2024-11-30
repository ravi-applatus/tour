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
import { TourEntity } from './tour.entity';

@Index('fk_tour_image_tour1_idx', ['tourId'], {})
@Entity('tour_image')
export class TourImageEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'tourId' })
  tourId: number;

  @Column('varchar', { name: 'pathFile', length: 128 })
  pathFile: string;

  /**
   * Relations
   */
  @ManyToOne(() => TourEntity, (tour) => tour.images, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'tourId', referencedColumnName: 'id' }])
  tour: TourEntity;

  @OneToMany(() => TourEntity, (tour) => tour.cover)
  tours: TourEntity[];
}
