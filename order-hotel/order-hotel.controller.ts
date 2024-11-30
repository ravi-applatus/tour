import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query,
  Header,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Access } from 'src/utils/decorators/access.decorator';
import { Filter } from 'src/utils/decorators/filter.decorator';
import { Limit } from 'src/utils/decorators/limit.decorator';
import { Page } from 'src/utils/decorators/page.decorator';
import { Sort } from 'src/utils/decorators/sort.decorator';
import { successfulResult } from '../../utils';
import { User } from '../../utils/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CreateOrderHotelDto } from './dto/create-order-hotel.dto';
import { CreateRoomOrderHotelDto } from './dto/create-room-order-hotel.dto';
import { UpdateAvailabilityStatusRoomDto } from './dto/update-availability-status-room.dto';
import { CreateTransferInfoDto } from './dto/update-transfer-info.dto';
import { AvailabilityStatus } from './entities/order-hotel-map-room.entity';
import { OrderHotelService } from './order-hotel.service';

@ApiTags('Order Hotel')
@Controller('order-hotels')
export class OrderHotelController {
  constructor(private orderHotelService: OrderHotelService) {}

  /**
   * -------------------------------------------------------
   * POST /order-hotels/1/send-voucher-by-email-to-hotel
   */
  @Post(':id/send-voucher-by-email-to-hotel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.SEND_EMAIL_TO_HOTEL)
  async sendEmailToHotels(@Param('id') orderHotelId: number) {
    await this.orderHotelService.sendEmailToHotel(orderHotelId);
    return successfulResult(['ووچر هتل باموفقیت ایمیل شد']);
  }

  /**
   * --------------------------------------------------------
   * Post /order-hotels/room
   */
  @Post('room')
  @ApiOperation({
    description:
      '<p dir="rtl">اضافه کردن اتاق برای یک سفارش، توسط نقش هایی با سطح دسترسی ADD_ROOM_ORDER_HOTEL <br> (مثلا ادمین یا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_ROOM_ORDER_HOTEL)
  @ApiQuery({ name: 'tourism_level_id', required: false })
  async addRoom(
    @User('tourismId') tourismId: number,
    @Body() dto: CreateRoomOrderHotelDto,
    @Query('tourism_level_id') tourismLevelId,
  ) {
    await this.orderHotelService.addRoom(dto, tourismId, tourismLevelId);

    return successfulResult(['اتاق جدید به این سفارش، با موفقیت اضافه شد.']);
  }

  /**
   * --------------------------------------------------------
   * Post /order-hotels
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت سفارش هتل جدید توسط نقش هایی با سطح دسترسی ADD_ORDER_HOTEL <br> (مثلا کارمند آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_ORDER_HOTEL)
  @ApiQuery({ name: 'tourism_level_id', required: false })
  async createOrderHotel(
    @User('id') userId: number,
    @User('tourismId') tourismId: number,
    @Body() dto: CreateOrderHotelDto,
    @Query('tourism_level_id') tourismLevelId,
  ) {
    const { messages, newOrder } =
      await this.orderHotelService.createOrderHotel(
        userId,
        dto,
        tourismId,
        tourismLevelId,
      );

    return successfulResult(messages, newOrder);
  }

  /**
   * --------------------------------------------------------
   * Post /order-hotels/calculate
   */
  @Post('calculate')
  @ApiOperation({
    description:
      '<p dir="rtl">محاسبه هزینه سفارش هتل جدید توسط نقش هایی با سطح دسترسی ADD_ORDER_HOTEL <br> (مثلا کارمند آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_ORDER_HOTEL)
  @ApiQuery({ name: 'tourism_level_id', required: false })
  async calculateOrderHotel(
    @User('tourismId') tourismId: number,
    @Body() dto: CreateOrderHotelDto,
    @Query('tourism_level_id') tourismLevelId,
  ) {
    const { rooms, amount, discountAmount, totalAmount } =
      await this.orderHotelService.initializeDataForCreatingOrderHotel(
        dto,
        tourismId,
        tourismLevelId,
      );

    return successfulResult([], {
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        maxCapacity: room.maxCapacity,
        maxExtraCapacity: room.maxExtraCapacity,
        price: room.prices[0].price,
        childExtraPrice: room.prices[0].childExtraPrice,
        quantity: room.quantity,
        amount: room.amount,
        discountAmount: room.discountAmount,
        totalAmount: room.totalAmount,
      })),
      amount,
      discountAmount,
      totalAmount,
    });
  }

  /**
   * -------------------------------------------------------
   * DELETE /order-hotels/room/1
   */
  @Delete('room/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف یک اتاق، از یک سفارش، توسط نقش هایی با سطح دسترسی DELETE_ROOM_ORDER_HOTEL <br> (مثلا ادمین یا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_ROOM_ORDER_HOTEL)
  async deleteRoomByMapId(
    @User('tourismId') tourismId: number,
    @Param('id') orderMapRoomId: number,
  ) {
    await this.orderHotelService.deleteRoomByMapId(orderMapRoomId, tourismId);
    return successfulResult(['اتاق موردنظر از این سفارش، باموفقیت حذف شد']);
  }

  /**
   * -------------------------------------------------------
   */
  @Get('export/excel-passengers')
  @Header('Content-Type', 'text/xlsx')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_ORDER_HOTEL)
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'hotel_id', required: false })
  @ApiQuery({ name: 'check_in', required: false })
  @ApiQuery({ name: 'check_out', required: false })
  @ApiQuery({ name: 'has_transfer', required: false })
  @ApiQuery({ name: 'tourism_number', required: false })
  @ApiQuery({ name: 'system_number', required: false })
  @ApiQuery({ name: 'invoice_status', required: false })
  async exportExcelBasedOnPassenger(
    @Filter([
      ['tourism_id', 'tourismId'],
      ['hotel_id', 'hotelRoom.hotelId'],
      ['check_in', 'checkIn'],
      ['check_out', 'checkOut'],
      ['tourism_number', 'invoice.tourismNumber'],
      ['system_number', 'invoice.tourismNumber'],
      ['invoice_status', 'invoice.status'],
    ])
    filters,
    @Query('has_transfer') hasTransfer,
    @User('tourismId') tourismId,
    @Res() res: Response,
  ) {
    const result = await this.orderHotelService.exportExcelBasedOnPassenger(
      filters,
      tourismId,
      hasTransfer === '1',
    );
    return res.download(`${result}`);
  }

  /**
   * -------------------------------------------------------
   */
  @Get('export/excel')
  @Header('Content-Type', 'text/xlsx')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_ORDER_HOTEL)
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'hotel_id', required: false })
  @ApiQuery({ name: 'check_in', required: false })
  @ApiQuery({ name: 'check_out', required: false })
  @ApiQuery({ name: 'has_transfer', required: false })
  @ApiQuery({ name: 'tourism_number', required: false })
  @ApiQuery({ name: 'system_number', required: false })
  @ApiQuery({ name: 'invoice_status', required: false })
  async exportExcel(
    @Filter([
      ['tourism_id', 'tourismId'],
      ['hotel_id', 'hotelRoom.hotelId'],
      ['check_in', 'checkIn'],
      ['check_out', 'checkOut'],
      ['tourism_number', 'invoice.tourismNumber'],
      ['system_number', 'invoice.tourismNumber'],
      ['invoice_status', 'invoice.status'],
    ])
    filters,
    @Query('has_transfer') hasTransfer,
    @User('tourismId') tourismId,
    @Res() res: Response,
  ) {
    const result = await this.orderHotelService.exportExcel(
      filters,
      tourismId,
      hasTransfer === '1',
    );
    return res.download(`${result}`);
  }

  /**
   * -------------------------------------------------------
   * GET /order-hotels
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده سفارش ها، توسط نقش هایی با سطح دسترسی GET_ORDER_HOTEL (مثلا ادمین) </p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_ORDER_HOTEL, // for report
    PermissionsType.GET_FINANCIAL_INFO_HOTEL,
  )
  @ApiQuery({ name: 'invoice_id', required: false })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'tourism_id', required: false }) // for report
  @ApiQuery({ name: 'hotel_id', required: false }) // for report
  @ApiQuery({ name: 'check_in', required: false }) // for report
  @ApiQuery({ name: 'check_out', required: false }) // for report
  @ApiQuery({ name: 'has_transfer', required: false }) // for report
  @ApiQuery({ name: 'tourism_number', required: false }) // for report
  @ApiQuery({ name: 'system_number', required: false }) // for report
  @ApiQuery({ name: 'invoice_status', required: false }) // for report
  @ApiQuery({
    name: 'availability_status',
    required: false,
    enum: AvailabilityStatus,
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'e.g. gte:2022-04-16[and]lte:2022-04-16',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getOrders(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      ['user_id', 'userId'],
      ['tourism_id', 'tourismId'], // for report
      ['invoice_id', 'invoiceId'],
      ['hotel_id', 'hotelRoom.hotelId'], // for report
      ['check_in', 'checkIn'], // for report
      ['check_out', 'checkOut'], // for report
      ['tourism_number', 'invoice.tourismNumber'], // for report
      ['system_number', 'invoice.tourismNumber'], // for report
      ['invoice_status', 'invoice.status'], // for report
      ['availability_status', 'orderMapRooms.availabilityStatus'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
    @Query('has_transfer') hasTransfer, // for report
    @User('tourismId') tourismId, // for report
    @Access(PermissionsType.GET_FINANCIAL_INFO_HOTEL) canGetFinancialInfo,
  ) {
    const data = await this.orderHotelService.getOrders(
      page,
      limit,
      filters,
      sorts,
      tourismId,
      hasTransfer === '1',
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /order-hotels/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده جزئیات یک سفارش خاص، توسط نقش هایی با سطح دسترسی GET_ORDER_HOTEL (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_ORDER_HOTEL,
    PermissionsType.GET_FINANCIAL_INFO_HOTEL,
  )
  async getHotelById(
    @Param('id') orderHotelId: number,
    @User('tourismId') tourismId: number,
    @Access(PermissionsType.GET_FINANCIAL_INFO_HOTEL) canGetFinancialInfo,
  ) {
    const data = await this.orderHotelService.getOrderHotelById(
      orderHotelId,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * PUT /order-hotels/1/availability-status-room
   */
  @Put(':id/availability-status-room')
  @ApiOperation({
    description:
      '<p dir="rtl"> تعیین وضعیت یک سفارش، توسط نقش هایی با سطح دسترسی UPDATE_AVAILABILITY_STATUS_ROOM <br> (مثلا ادمین ، که امکان تعیین وضعیت موجودی اتاق را دارد.)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_AVAILABILITY_STATUS_ROOM)
  async updateAvailabilityStatusRoom(
    @Param('id') orderHotelMapRoomId: number,
    @Body() dto: UpdateAvailabilityStatusRoomDto,
  ) {
    await this.orderHotelService.updateAvailabilityStatusRoom(
      orderHotelMapRoomId,
      dto,
    );
    return successfulResult(['موجودی اتاق، با موفقیت تعیین وضعیت شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /order-hotels/1/transfer-info
   */
  @Put(':id/transfer-info')
  @ApiOperation({
    description:
      '<p dir="rtl"> تغییر اطلاعات پرواز، توسط نقش هایی با سطح دسترسی ADD_ORDER_HOTEL <br> (مثلا کارمند آژانس.)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_ORDER_HOTEL)
  async updateTransferInfo(
    @Param('id') orderHotelId: number,
    @Body() dto: CreateTransferInfoDto,
  ) {
    await this.orderHotelService.updateTransferInfo(orderHotelId, dto);
    return successfulResult(['اطلاعات پرواز با موفقیت آپدیت شد']);
  }
}
