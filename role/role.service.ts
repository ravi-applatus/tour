import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { LinkSingleType } from './dto/link-role-single-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionEntity } from './entities/permission.entity';
import { RoleMapPermissionEntity } from './entities/role-map-permission.entity';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(RoleMapPermissionEntity)
    private mappingRepository: Repository<RoleMapPermissionEntity>,

    private error: ErrorService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /roles
   */
  async getRoles() {
    return await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.roleMapPermissions', 'roleMapPermissions')
      .leftJoinAndSelect('roleMapPermissions.permission', 'permission')
      .getMany();
  }

  /**
   * -------------------------------------------------------
   * GET /permissions
   */
  async getPermissions() {
    return await this.permissionRepository.find();
  }

  /**
   * -------------------------------------------------------
   * POST /roles
   * add new role
   */
  async addRole(dto: CreateRoleDto) {
    const newRole = new RoleEntity();
    newRole.name = dto.name;
    newRole.lock = false;

    const { identifiers } = await this.roleRepository
      .createQueryBuilder()
      .insert()
      .values(newRole)
      .execute();

    const newRoleId = identifiers[0].id;
    return await this.roleRepository.findOne(newRoleId);
  }

  /**
   * -------------------------------------------------------
   * PUT /roles/1
   */
  async updateRole(roleId: number, dto: UpdateRoleDto) {
    const data = await this.roleRepository.findOne(roleId);

    if (data?.lock === true) {
      this.error.methodNotAllowed(['امکان آپدیت نقش سیستمی وجود ندارد']);
    }

    return await this.roleRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: roleId })
      .execute();
  }

  /**
   * Linking a new permissions to the role
   * Unlinking the old permissions from the role
   */
  async linkPermissionsToRole(roleId: number, newPermissionsId: number[]) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['roleMapPermissions'],
    });

    const links: number[] = [];
    const unlinks: number[] = [];

    // Detecting the permissions that should be unlinked from the role
    role.roleMapPermissions.forEach((oldRP) => {
      if (!newPermissionsId.includes(oldRP.permissionId)) {
        unlinks.push(oldRP.id);
      }
    });

    // Detecting the permissions that should be linked to the role
    const oldPermissionsId = role.roleMapPermissions.map(
      (rp) => rp.permissionId,
    );
    newPermissionsId.forEach((newRP) => {
      if (!oldPermissionsId.includes(newRP)) {
        links.push(newRP);
      }
    });

    await this._addLinks(roleId, links);
    await this._deleteLinks(unlinks);
  }

  /**
   * Linking a new permission to the role
   * Unlinking the old permission from the role
   */
  async linkSinglePermissionToRole(
    roleId: number,
    permissionId: number,
    type: LinkSingleType,
  ) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['roleMapPermissions'],
    });

    // Detecting the permissions that should be unlinked from the role
    const existMapping = role.roleMapPermissions.find(
      (rolePermission) => rolePermission.permission.id === permissionId,
    );

    if (!existMapping && type === 'link') {
      await this._addLinks(roleId, [permissionId]);
    }

    if (existMapping && type === 'unlink') {
      await this._deleteLinks([existMapping.id]);
    }
  }

  private async _addLinks(roleId: number, permissionsId: number[]) {
    if (permissionsId.length > 0) {
      return await this.mappingRepository
        .createQueryBuilder('rp')
        .insert()
        // [{roleId: 1, permissionId: 2}, {roleId: 1, permissionId: 4}]
        .values(permissionsId.map((permissionId) => ({ roleId, permissionId })))
        .execute();
    }
  }

  private async _deleteLinks(mappingId: number[]) {
    if (mappingId.length > 0) {
      return await this.mappingRepository
        .createQueryBuilder('rp')
        .delete()
        // [1, 3, 4]
        // WHERE IN (1,3,4)
        .whereInIds(mappingId)
        .execute();
    }
  }
}
