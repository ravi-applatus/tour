import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { successfulResult } from 'src/utils';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingService } from './setting.service';

@ApiTags('Setting')
@Controller('settings')
export class SettingController {
  constructor(private settingService: SettingService) {}

  /**
   * -------------------------------------------------------
   * GET /settings
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_SETTING)
  async get() {
    const data = await this.settingService.get();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /settings/public
   */
  @Get('public')
  async getByTourism() {
    const data = await this.settingService.get([
      'startWorkingTime',
      'endWorkingTime',
      'bankTransferDescription',
    ]);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * PUT /settings
   */
  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_SETTING)
  async update(@Body() dto: UpdateSettingDto) {
    await this.settingService.update(dto);
    return successfulResult(['تنظیمات با موفقیت ویرایش شد']);
  }
}
