import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { successfulResult } from 'src/utils';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { LinkRolePermissionsDto } from './dto/link-role-permissions.dto';
import { LinkRoleSinglePermissionDto } from './dto/link-role-single-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsType } from './entities/permission.entity';
import { RoleService } from './role.service';

@ApiTags('Role')
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  /**
   * -------------------------------------------------------
   * GET /permissions
   */
  @Get('permissions')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده سطوح دسترسی نقش ها، توسط نقشی با سطح دسترسی GET_ROLE <br> (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_ROLE)
  async getPermissions() {
    const data = await this.roleService.getPermissions();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /roles
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده نقش ها، توسط نقشی با سطح دسترسی GET_ROLE <br> (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_ROLE)
  async getRoles() {
    const data = await this.roleService.getRoles();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * POST /roles
   * add new role
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ایجاد نقش جدید توسط نقشی با سطح دسترسی ADD_ROLE <br> (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_ROLE)
  async addRole(@Body() dto: CreateRoleDto) {
    const newRole = await this.roleService.addRole(dto);
    return successfulResult(['نقش جدید باموفقیت ایجاد شد'], newRole);
  }

  /**
   * -------------------------------------------------------
   * PUT /roles/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش یک نقش خاص، توسط نقشی با سطح دسترسی UPDATE_ROLE <br> (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_ROLE)
  async updateRole(@Param('id') roleId: number, @Body() dto: UpdateRoleDto) {
    const data = await this.roleService.updateRole(roleId, dto);
    return successfulResult(['نقش مربوطه با موفقیت آپدیت شد'], data);
  }

  /**
   * -------------------------------------------------------
   * PUT roles/:id/permissions
   */
  @Put(':id/permissions')
  @ApiOperation({
    description:
      '<p dir="rtl">نسبت دادن چند سطح دسترسی، به یک نقش خاص، توسط نقشی با سطح دسترسی UPDATE_ROLE <br> (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_ROLE)
  async updateLinkPermissions(
    @Body() dto: LinkRolePermissionsDto,
    @Param('id') roleId: number,
  ) {
    await this.roleService.linkPermissionsToRole(roleId, dto.permissionsId);

    return successfulResult([
      'مجوز دسترسی های موردنظر برای این نقش، باموفقیت آپدیت شد',
    ]);
  }

  /**
   * -------------------------------------------------------
   * PUT roles/:id/permission/single
   */
  @Put(':id/permission/single')
  @ApiOperation({
    description:
      '<p dir="rtl">نسبت دادن یک سطح دسترسی خاص، به یک نقش خاص، توسط نقشی با سطح دسترسی UPDATE_ROLE <br> (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_ROLE)
  async updateLinkPermission(
    @Body() dto: LinkRoleSinglePermissionDto,
    @Param('id') roleId: number,
  ) {
    await this.roleService.linkSinglePermissionToRole(
      roleId,
      dto.permissionId,
      dto.type,
    );

    return successfulResult([
      'مجوز دسترسی موردنظر برای این نقش، باموفقیت آپدیت شد',
    ]);
  }
}
