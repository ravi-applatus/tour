import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleMapPermissionEntity } from './role-map-permission.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { BooleanTransformer } from 'src/utils/transformers/BooleanTransformer';

export enum RoleIds {
  ADMIN = 1,
  CONTENT_PRODUCER = 2,
  SALES_MANAGER = 3,
  MARKETER = 4,
  TOURISM_MANAGER = 5,
  TOURISM_EMPLOYEE = 6,
}

@Entity('role')
export class RoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 45 })
  name: string;

  @Column('tinyint', {
    name: 'lock',
    default: () => '0',
    transformer: new BooleanTransformer(),
  })
  lock: boolean;

  @OneToMany(
    () => RoleMapPermissionEntity,
    (roleMapPermission) => roleMapPermission.role,
  )
  roleMapPermissions: RoleMapPermissionEntity[];

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];
}
