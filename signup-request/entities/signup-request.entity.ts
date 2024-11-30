import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SignupRequestStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
}

@Entity('signup_request')
export class SignupRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'tourismName', length: 128 })
  tourismName: string;

  @Column('varchar', { name: 'adminName', length: 128 })
  adminName: string;

  @Column('varchar', { name: 'phone', length: 45 })
  phone: string;

  @Column('varchar', { name: 'email', length: 255 })
  email: string;

  @Column('varchar', { name: 'address', length: 255 })
  address: string;

  @Column('enum', {
    name: 'status',
    enum: SignupRequestStatus,
    default: () => SignupRequestStatus.pending,
  })
  status: SignupRequestStatus;

  @Column('varchar', { name: 'adminComment', nullable: true, length: 255 })
  adminComment: string | null;

  @Column('datetime', { name: 'createdAt' })
  createdAt: Date;
}
