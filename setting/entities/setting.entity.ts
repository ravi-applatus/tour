import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CurrencySources {
  liqotrip = 'liqotrip',
  ragaex = 'ragaex',
}

@Entity('setting')
export class SettingEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('time', { name: 'startWorkingTime', nullable: true })
  startWorkingTime: string | null;

  @Column('time', { name: 'endWorkingTime', nullable: true })
  endWorkingTime: string | null;

  @Column('int', { name: 'passengersInfoUpdateDeadlineHours', nullable: true })
  passengersInfoUpdateDeadlineHours: number | null;

  @Column('text', { name: 'bankTransferDescription', nullable: true })
  bankTransferDescription: string | null;

  @Column('text', { name: 'voucherDescription', nullable: true })
  voucherDescription: string | null;

  @Column('varchar', { name: 'transferBoard', nullable: true, length: 45 })
  transferBoard: string | null;

  @Column('varchar', { name: 'transferPhone', nullable: true, length: 45 })
  transferPhone: string | null;

  @Column('varchar', { name: 'transferPhone2', nullable: true, length: 45 })
  transferPhone2: string | null;

  @Column('varchar', { name: 'transferExcursion', nullable: true, length: 45 })
  transferExcursion: string | null;

  @Column('varchar', { name: 'adminName', nullable: true, length: 45 })
  adminName: string | null;

  @Column('varchar', { name: 'adminPhone', nullable: true, length: 45 })
  adminPhone: string | null;

  @Column('varchar', { name: 'adminFax', nullable: true, length: 45 })
  adminFax: string | null;

  @Column('varchar', { name: 'adminEmail', nullable: true, length: 255 })
  adminEmail: string | null;

  @Column('enum', {
    name: 'currencySource',
    enum: CurrencySources,
    default: () => CurrencySources.liqotrip,
  })
  currencySource: CurrencySources;
}
