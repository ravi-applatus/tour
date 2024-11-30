import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';
// import { Permission } from './Permission';
// import { Role } from './Role';

@Index('fk_role_permission_role1_idx', ['roleId'], {})
@Index('fk_role_permission_permission1_idx', ['permissionId'], {})
@Entity('role_map_permission')
export class RoleMapPermissionEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'roleId' })
  roleId: number;

  @Column('int', { name: 'permissionId' })
  permissionId: number;

  @ManyToOne(
    () => PermissionEntity,
    (permission) => permission.roleMapPermissions,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'permissionId', referencedColumnName: 'id' }])
  permission: PermissionEntity;

  @ManyToOne(() => RoleEntity, (role) => role.roleMapPermissions, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'roleId', referencedColumnName: 'id' }])
  role: RoleEntity;
}
