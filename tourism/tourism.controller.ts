import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { successfulResult } from 'src/utils';
import { Filter } from 'src/utils/decorators/filter.decorator';
import { Limit } from 'src/utils/decorators/limit.decorator';
import { Page } from 'src/utils/decorators/page.decorator';
import { Sort } from 'src/utils/decorators/sort.decorator';
import { User } from 'src/utils/decorators/user.decorator';
import { multerOptions } from 'src/utils/multer.options';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CreateTourismLevelDto } from './dto/create-tourism-level.dto';
import { CreateTourismDto } from './dto/create-tourism.dto';
import { UpdateTourismByMarketerDto } from './dto/update-tourism-by-marketer.dto';
import { UpdateTourismLevelDto } from './dto/update-tourism-level.dto';
import { UpdateTourismDto } from './dto/update-tourism.dto';
import { UpdateWalletTourismDto } from './dto/update-wallet-tourism';
import { TourismService } from './tourism.service';

@ApiTags('Tourism')
@Controller('tourisms')
export class TourismController {
  constructor(private tourismService: TourismService) {}

  /**
   * -------------------------------------------------------
   * GET /tourisms/level/by-admin
   */
  @Get('/level/by-admin')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده سطوح تعریف شده در سیستم، برای آژانس ها، توسط نقشی با سطح دسترسی GET_TOURISM_LEVEL_BY_ADMIN (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM_LEVEL_BY_ADMIN)
  async getTourismsLevelByAdmin() {
    const data = await this.tourismService.getTourismsLevel(true);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms/level
   */
  @Get('/level')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده سطوح تعریف شده در سیستم، برای آژانس ها، توسط نقشی با سطح دسترسی GET_TOURISM_LEVEL (مثلا مدیرفروش)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM_LEVEL)
  async getTourismsLevel() {
    const data = await this.tourismService.getTourismsLevel();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms/level/1/by-admin
   */
  @Get('/level/:id/by-admin')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده یک سطح خاص تعریف شده برای آژانس ها، توسط نقشی با سطح دسترسی GET_TOURISM_LEVEL_BY_ADMIN (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM_LEVEL_BY_ADMIN)
  async getTourismLevelById(@Param('id') tourismLevelId: number) {
    const data = await this.tourismService.getTourismLevelById(tourismLevelId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * POST /tourisms/level
   * add new level for tourism
   */
  @Post('/level')
  @ApiOperation({
    description:
      '<p dir="rtl">ایجاد یک سطح جدید، برای آژانس ها، توسط نقشی با سطح دسترسی GET_TOURISM_LEVEL_BY_ADMIN (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM_LEVEL_BY_ADMIN)
  async addLevel(@Body() dto: CreateTourismLevelDto) {
    const newLevel = await this.tourismService.addLevel(dto);
    return successfulResult(['سطح جدید باموفقیت اضافه شد'], newLevel);
  }

  /**
   * -------------------------------------------------------
   * PUT /tourisms/level/1
   */
  @Put('/level/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش یک سطح خاص تعریف شده برای آژانس ها، توسط نقشی با سطح دسترسی UPDATE_TOURISM_LEVEL (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_TOURISM_LEVEL)
  async updateLevel(
    @Param('id') levelId: number,
    @Body() dto: UpdateTourismLevelDto,
  ) {
    await this.tourismService.updateLevel(levelId, dto);
    return successfulResult(['سطح موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * DELETE /tourisms/level/1
   */
  @Delete('/level/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف یک سطح خاص تعریف شده برای آژانس ها، توسط نقشی با سطح دسترسی DELETE_TOURISM_LEVEL (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_TOURISM_LEVEL)
  async deleteLevelById(@Param('id') levelId: number) {
    await this.tourismService.deleteLevelById(levelId);
    return successfulResult(['سطح موردنظر باموفقیت حذف شد']);
  }

  /**
   * -------------------------------------------------------
   * POST /tourism/by-marketer
   * Adding a tourism  by the marketer
   */
  @Post('by-marketer')
  @ApiOperation({
    description:
      '<p dir="rtl">ایجاد آژانس توسط بازاریاب ADD_TOURISM_BY_MARKETER </p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_TOURISM_BY_MARKETER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('licenseFile', multerOptions('tourisms')))
  async addTourism(
    @User('id') marketerId,
    @Body() dto: CreateTourismDto,
    @UploadedFile() licenseFile,
  ) {
    const newTourism = await this.tourismService.addTourism(
      dto,
      marketerId,
      licenseFile,
    );
    return successfulResult(
      [' آژانس گردشگری جدید باموفقیت ایجاد شد'],
      newTourism,
    );
  }

  /**
   * -------------------------------------------------------
   * PUT /tourism/by-marketer/1
   */
  @Put('/by-marketer/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات یک آژانس خاص، توسط بازاریاب، با سطح دسترسی UPDATE_TOURISM_BY_MARKETER  <br> (ویرایش اطلاعاتی از جمله مدارک آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_TOURISM_BY_MARKETER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('licenseFile', multerOptions('tourisms')))
  async updateTourismByMarketer(
    @Param('id') tourismId: number,
    @Body() dto: UpdateTourismByMarketerDto,
    @UploadedFile() licenseFile,
  ) {
    await this.tourismService.updateTourismByMarketer(
      tourismId,
      dto,
      licenseFile,
    );
    return successfulResult(['آژانس موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms/by-marketer
   */
  @Get('by-marketer')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات آژانس ها، توسط نقش هایی با سطح دسترسی GET_TOURISM_BY_MARKETER (مثلا بازاریاب)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM_BY_MARKETER)
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'admin_id', required: false })
  @ApiQuery({ name: 'level_id', required: false })
  @ApiQuery({ name: 'address', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getTourismByMarketer(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      ['admin_id', 'adminId'],
      ['level_id', 'levelId'],
      'name',
      'address',
      'status',
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
    @User('id') marketerId,
  ) {
    const data = await this.tourismService.getTourisms(
      page,
      limit,
      filters,
      sorts,
      marketerId,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms/by-marketer/1
   */
  @Get('by-marketer/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک آژانس خاص، توسط نقش هایی با سطح دسترسی GET_TOURISM_BY_MARKETER (مثلا بازاریاب)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM_BY_MARKETER)
  async getTourismByIdByMarketer(
    @Param('id') tourismId: number,
    @User('id') marketerId: number,
  ) {
    const data = await this.tourismService.getTourismById(
      tourismId,
      marketerId,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک آژانس خاص، توسط نقش هایی با سطح دسترسی GET_TOURISM (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM)
  async getTourismById(@Param('id') tourismId: number) {
    const data = await this.tourismService.getTourismById(tourismId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات آژانس ها، توسط نقش هایی با سطح دسترسی GET_TOURISM (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM)
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'admin_id', required: false })
  @ApiQuery({ name: 'marketer_id', required: false })
  @ApiQuery({ name: 'level_id', required: false })
  @ApiQuery({ name: 'address', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getTourism(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      ['admin_id', 'adminId'],
      ['marketer_id', 'marketerId'],
      ['level_id', 'levelId'],
      'name',
      'address',
      'status',
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.tourismService.getTourisms(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * Put /tourisms/1/wallet
   */
  @Put(':id/wallet')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_TOURISM_WALLET)
  async updateWalletUser(
    @Param('id') tourismId: number,
    @Body() dto: UpdateWalletTourismDto,
  ) {
    await this.tourismService.updateTourismWallet(tourismId, dto);
    return successfulResult(['کیف پول آژانس با موفقیت آپدیت شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /tourisms/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات یک آژانس خاص، توسط نقش هایی با سطح دسترسی UPDATE_TOURISM (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_TOURISM)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('licenseFile', multerOptions('tourisms')))
  async updateTourism(
    @Param('id') tourismId: number,
    @Body() dto: UpdateTourismDto,
    @UploadedFile() licenseFile,
  ) {
    await this.tourismService.updateTourism(tourismId, dto, licenseFile);
    return successfulResult(['اطلاعات آژانس موردنظر با موفقیت ویرایش شد']);
  }
}
