import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { UpdateAvailabilityRoomDto } from './dto/update-availability-room.dto';
import { UpdateContentRoomDto } from './dto/update-content-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateRoomPriceDto } from './dto/update-room-price.dto';
import { HotelRoomService } from './hotel-room.service';
import { Access } from 'src/utils/decorators/access.decorator';

@ApiTags('Room')
@Controller('rooms')
export class HotelRoomController {
  constructor(private hotelRoomService: HotelRoomService) {}

  /**
   * --------------------------------------------------------
   * GET /rooms/statistic-room
   */
  @Get('statistic-room')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده آمار اتاق های رزرو شده و موجود، توسط نقش هایی با سطح دسترسی GET_ROOM_STATISTICS(مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_ROOM_STATISTICS)
  async getSumRoom() {
    const data = await this.hotelRoomService.getSumRoom();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * update /rooms/price
   * update price for room of hotel
   */
  @Put('/price')
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت/ ویرایش قیمت، برای اتاق هتل، توسط نقش هایی با سطح دسترسی UPDATE_ROOM_PRICE (مثلا ادمین یا کارشناس فروش)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_ROOM_PRICE)
  async addRoomPrice(@Body() dto: UpdateRoomPriceDto) {
    const roomPrice = await this.hotelRoomService.addUpdateRoomPrice(dto);
    return successfulResult(
      ['قیمت برای اتاق موردنظر، باموفقیت آپدیت شد'],
      roomPrice,
    );
  }

  /**
   * -------------------------------------------------------
   * delete /rooms/price/:id
   */
  @Delete('/price/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت/ حذف قیمت برای اتاق هتل، توسط نقش هایی با سطح دسترسی UPDATE_ROOM_PRICE (مثلا ادمین یا کارشناس فروش)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_ROOM_PRICE)
  async deleteRoomPrice(@Param('id') priceId: number) {
    await this.hotelRoomService.deleteRoomPrice(priceId);
    return successfulResult(['قیمت مورد نظر حذف شد']);
  }

  /**
   * -------------------------------------------------------
   * GET /rooms/availability
   */
  @Get('availability')
  @ApiOperation({
    description:
      '<p dir="rtl">گرفتن موجودی اتاقی خاص GET_AVAILABILITY_ROOM</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_AVAILABILITY_ROOM)
  @ApiQuery({ name: 'room_id', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getAvailabilitiesRoom(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([['room_id', 'roomId'], 'date'])
    filters,
  ) {
    const list = await this.hotelRoomService.getAvailabilitiesRoom(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], list);
  }

  /**
   * -------------------------------------------------------
   * GET /rooms/suggestion
   */
  @Get('suggestion')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده لیست اتاق های هتل، توسط نقش هایی با سطح دسترسی GET_HOTEL <br> (دقت شود که ادمین فقط لیست اتاق ها را می بیند اما پرسنل آژانس، قیمت اتاق های هتل های تأیید شده مربوط به سطحی که دارند را هم می توانند ببینند.)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_HOTEL,
    PermissionsType.GET_FINANCIAL_INFO_HOTEL,
  )
  @ApiQuery({ name: 'hotel_id', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'count_passanger', required: false })
  @ApiQuery({ name: 'tourism_level_id', required: false })
  @ApiQuery({ name: 'check_in', required: false })
  @ApiQuery({ name: 'check_out', required: false })
  async getHotelRoomsSuggestion(
    @User('tourismId') tourismId,
    @Filter([['hotel_id', 'hotelId'], 'name']) filters,
    @Query('tourism_level_id') tourismLevelId,
    @Query('check_in') checkIn,
    @Query('check_out') checkOut,
    @Query('count_passanger') countPassanger,
    @Access(PermissionsType.GET_FINANCIAL_INFO_HOTEL) canGetFinancialInfo,
  ) {
    const data = await this.hotelRoomService.getHotelRoomsSuggestion(
      filters,
      tourismLevelId,
      tourismId,
      canGetFinancialInfo,
      checkIn,
      checkOut,
      countPassanger,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /rooms/quick-price
   */
  @Get('quick-price')
  @ApiOperation({
    description: '<p dir="rtl">سطح دسترسی UPDATE_ROOM_PRICE</p>',
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.UPDATE_ROOM_PRICE,
    PermissionsType.GET_FINANCIAL_INFO_HOTEL,
  )
  @ApiQuery({ name: 'hotel_id', required: true })
  @ApiQuery({ name: 'tourism_level_id', required: true })
  @ApiQuery({ name: 'from_date', required: true })
  @ApiQuery({ name: 'end_date', required: true })
  async getHotelRoomsQuickPrice(
    @Query('hotel_id') hotelId,
    @Query('tourism_level_id') tourismLevelId,
    @Query('from_date') fromDate,
    @Query('end_date') endDate,
    @Access(PermissionsType.GET_FINANCIAL_INFO_HOTEL) canGetFinancialInfo,
  ) {
    const data = await this.hotelRoomService.getHotelRoomsQuickPrice(
      hotelId,
      tourismLevelId,
      fromDate,
      endDate,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /rooms
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده لیست اتاق های هتل، توسط نقش هایی با سطح دسترسی GET_HOTEL <br> (دقت شود که ادمین فقط لیست اتاق ها را می بیند اما پرسنل آژانس، قیمت اتاق های هتل های تأیید شده مربوط به سطحی که دارند را هم می توانند ببینند.)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL)
  @ApiQuery({ name: 'hotel_id', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'count_passanger', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getHotelRooms(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([['hotel_id', 'hotelId'], 'name'])
    filters,
  ) {
    const data = await this.hotelRoomService.getHotelRooms(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /rooms/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده جزئیات یک اتاق خاص، از یک هتل، توسط نقش هایی با سطح دسترسی GET_HOTEL <br> (دقت شود که برای آژانس ها، فقط جزئیات مربوط به اتاق های verified شده، قایل نمایش است)</p>',
  })
  @ApiQuery({ name: 'tourism_level_id', required: false })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_HOTEL,
    PermissionsType.GET_FINANCIAL_INFO_HOTEL,
  )
  async getHotelRoomById(
    @Param('id') roomId: number,
    @Query('tourism_level_id') tourismLevelId,
    @User('tourismId') tourismId: number,
    @Access(PermissionsType.GET_FINANCIAL_INFO_HOTEL) canGetFinancialInfo,
  ) {
    const data = await this.hotelRoomService.getHotelRoomById(
      roomId,
      tourismLevelId,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * POST /rooms
   * add new room for hotel
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت یک اتاق جدید برای یک هتل خاص، توسط نقش هایی با سطح دسترسی ADD_HOTEL (مثلا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_HOTEL)
  async addHotelRoom(@Body() dto: CreateHotelRoomDto) {
    const newRoom = await this.hotelRoomService.addHotelRoom(dto);
    return successfulResult(
      ['اتاق جدید برای هتل موردنظر، باموفقیت اضافه شد'],
      newRoom,
    );
  }

  /**
   * -------------------------------------------------------
   * PUT /rooms/content/1
   */
  @Put('content/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات اتاقی خاص، توسط کارشناس تولید محتوا، با سطح دسترسی UPDATE_CONTENT_ROOM</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_CONTENT_ROOM)
  async updateContentRoom(
    @Param('id') roomId: number,
    @Body() dto: UpdateContentRoomDto,
  ) {
    await this.hotelRoomService.updateContentRoom(roomId, dto);
    return successfulResult(['اطلاعات اتاق موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /rooms/availability
   */
  @Put('availability')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش موجودی اتاقی خاص، توسط مدیر با سطح دسترسی UPDATE_AVAILABILITY_ROOM</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_AVAILABILITY_ROOM)
  async updateAvailabilityRoom(@Body() dto: UpdateAvailabilityRoomDto) {
    await this.hotelRoomService.updateAvailabilityRoom(dto);
    return successfulResult(['موجودی اتاق موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /rooms/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اتاقی خاص، توسط نقش هایی با سطح دسترسی UPDATE_ROOM (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_ROOM)
  async updateRoom(@Param('id') roomId: number, @Body() dto: UpdateRoomDto) {
    await this.hotelRoomService.updateRoom(roomId, dto);
    return successfulResult(['اتاق موردنظر با موفقیت ویرایش شد']);
  }
}
