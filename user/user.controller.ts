import {
  Body,
  Controller,
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
import { CreateTourismEmployeeDto } from './dto/create-tourism-employee.dto';
import { CreateTourismManagerDto } from './dto/create-tourism-manager.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateTourismEmployeeDto } from './dto/update-tourism-employee.dto';
import { UpdateUserTourismDto } from './dto/update-user-tourism.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * -------------------------------------------------------
   * POST /users/tourism-manager/by-marketer
   * Adding a new user by the user who have ADD_TOURISM_MANAGER permission
   */
  @Post('tourism-manager/by-marketer')
  @ApiOperation({
    description:
      '<p dir="rtl">ایجاد مدیر آژانس توسط نقش هایی با سطح دسترسی ADD_TOURISM_MANAGER (مثلا بازاریاب)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_TOURISM_MANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('identityCardFile', multerOptions('tourisms')),
  )
  async addTourismManager(
    @Body() dto: CreateTourismManagerDto,
    @UploadedFile() identityCardFile,
  ) {
    const newUser = await this.userService.addTourismManager(
      dto,
      identityCardFile,
    );
    return successfulResult(
      ['مدیر آژانس گردشگری جدید باموفقیت ایجاد شد'],
      newUser,
    );
  }

  /**
   * -------------------------------------------------------
   * PUT /users/tourism/by-marketer
   */
  @Put('tourism/by-marketer')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات مدیر و کارمندان آژانس، توسط نقش هایی با سطح دسترسی UPDATE_USER_TOURISM (مثلا بازاریاب)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_USER_TOURISM)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('identityCardFile', multerOptions('tourisms')),
  )
  async updateTourismByMarketer(
    @Body() dto: UpdateUserTourismDto,
    @User('id') marketerId,
    @UploadedFile() identityCardFile,
  ) {
    await this.userService.updateUserTourismByMarketer(
      dto,
      marketerId,
      identityCardFile,
    );
    return successfulResult(['مدیر/کارمند آژانس موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /users/tourism-employee/by-tourism-manager
   */
  @Put('tourism-employee/by-tourism-manager')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات کارمندان آژانس، توسط نقش هایی با سطح دسترسی UPDATE_TOURISM_EMPLOYEE (مثلا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_TOURISM_EMPLOYEE)
  async updateTourismEmployee(
    @Body() dto: UpdateTourismEmployeeDto,
    @User('id') adminId,
  ) {
    await this.userService.updateTourismEmployee(dto, adminId);
    return successfulResult(['کارمند آژانس موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * GET /users/tourism-employee/by-tourism-manager
   */
  @Get('tourism-employee/by-tourism-manager')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات کارمندان آژانس، توسط نقش هایی با سطح دسترسی GET_TOURISM_EMPLOYEE (مثلا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM_EMPLOYEE)
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'mobile', required: false })
  @ApiQuery({ name: 'role_id', required: false })
  @ApiQuery({ name: 'identity_card_number', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'e.g. gte:2022-04-16[and]lte:2022-04-16',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getTourismEmployee(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'email',
      'mobile',
      'status',
      ['role_id', 'roleId'],
      ['identity_card_number', 'identityCardNumber'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
    @User('id') adminId,
  ) {
    const data = await this.userService.getUserTourism(
      page,
      limit,
      filters,
      sorts,
      null,
      adminId,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /users/tourism/by-marketer
   */
  @Get('tourism/by-marketer')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات مدیران و کارمندان آژانس، توسط نقش هایی با سطح دسترسی GET_USER_TOURISM (مثلا بازاریاب)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_USER_TOURISM)
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'mobile', required: false })
  @ApiQuery({ name: 'role_id', required: false })
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'identity_card_number', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'e.g. gte:2022-04-16[and]lte:2022-04-16',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getUserTourism(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'email',
      'mobile',
      'status',
      ['role_id', 'roleId'],
      ['tourism_id', 'tourismId'],
      ['identity_card_number', 'identityCardNumber'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
    @User('id') marketerId,
  ) {
    const data = await this.userService.getUserTourism(
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
   * POST /users
   * A user who has "ADD_USER" permission can add a new user
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ایجاد کاربر جدید توسط نقش هایی که سطح دسترسی ADD_USER <br> را دارند. (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_USER)
  async addUser(@Body() dto: CreateUserDto) {
    const newUser = await this.userService.addUser(dto);
    return successfulResult(['کاربر جدید باموفقیت ایجاد شد'], newUser);
  }

  /**
   * -------------------------------------------------------
   * POST /users/tourism-employee/by-tourism-manager
   * add new user by user who have ADD_TOURISM_EMPLOYEE permission
   */
  @Post('tourism-employee/by-tourism-manager')
  @ApiOperation({
    description:
      '<p dir="rtl">ایجاد کاربر جدید توسط نقش هایی با سطح دسترسی ADD_TOURISM_EMPLOYEE <br> (مثلا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_TOURISM_EMPLOYEE)
  async addTourismEmployee(
    @Body() dto: CreateTourismEmployeeDto,
    @User('tourismId') tourismId,
  ) {
    const newUser = await this.userService.addTourismEmployee(dto, tourismId);
    return successfulResult(['کارمند موردنظر باموفقیت ایجاد شد'], newUser);
  }

  /**
   * -------------------------------------------------------
   * GET /users/wallets-history
   */
  @Get('wallets-history')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده تاریخچه کیف پول کاربران، توسط نقش هایی با سطح دسترسی GET_USER_WALLET_HISTORY (مثلا ادمین یا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_USER_WALLET_HISTORY)
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'e.g. gte:2022-04-16[and]lte:2022-04-16',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getWalletsHistory(
    @User('tourismId') tourismId,
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'type',
      ['tourism_id', 'tourismId'],
      ['user_id', 'userId'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.userService.getWalletsHistory(
      page,
      limit,
      filters,
      sorts,
      tourismId,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /users/1/wallets
   */
  @Get(':id/wallets')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات حساب بانکی یک کاربر خاص، توسط نقش هایی با سطح دسترسی GET_USER (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_USER)
  async getWalletUsers(@Param('id') userId: number) {
    const data = await this.userService.getWalletUsers(userId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /users
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات کاربران، توسط نقش هایی با سطح دسترسی GET_USER (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_USER)
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'mobile', required: false })
  @ApiQuery({ name: 'role_id', required: false })
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'identity_card_number', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'e.g. gte:2022-04-16[and]lte:2022-04-16',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getUsers(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'email',
      'mobile',
      'status',
      ['role_id', 'roleId'],
      ['tourism_id', 'tourismId'],
      ['identity_card_number', 'identityCardNumber'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.userService.getUsers(page, limit, filters, sorts);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * PUT /users
   */
  @Put()
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات کاربران، توسط نقش هایی با سطح دسترسی UPDATE_USER (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_USER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('identityCardFile', multerOptions('tourisms')),
  )
  async updateUser(
    @Body() dto: UpdateUserDto,
    @UploadedFile() identityCardFile,
  ) {
    await this.userService.updateUser(dto.id, dto, identityCardFile);
    return successfulResult(['کاربر موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * GET /users/tourism/by-marketer/1
   */
  @Get('/tourism/by-marketer/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک کاربر، توسط نقش هایی با سطح دسترسی GET_USER_TOURISM (مثلا بازاریاب)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_USER_TOURISM)
  async getUserTourismById(
    @User('id') marketerId: number,
    @Param('id') userId: number,
  ) {
    const data = await this.userService.getUserTourismById(marketerId, userId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /users/1
   */
  @Get('/tourism-employee/by-tourism-manager/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک کاربر، توسط نقش هایی با سطح دسترسی GET_TOURISM_EMPLOYEE (مثلا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOURISM_EMPLOYEE)
  async getEmployeeById(
    @Param('id') userId: number,
    @User('tourismId') tourismId,
  ) {
    const data = await this.userService.getEmployeeById(userId, tourismId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /users/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک کاربر، توسط نقش هایی با سطح دسترسی GET_USER (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_USER)
  async getUserById(@Param('id') userId: number) {
    const data = await this.userService.getUserById(userId);
    return successfulResult([], data);
  }
}
