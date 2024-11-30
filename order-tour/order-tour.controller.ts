import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { successfulResult } from 'src/utils';
import { Access } from 'src/utils/decorators/access.decorator';
import { Filter } from 'src/utils/decorators/filter.decorator';
import { Limit } from 'src/utils/decorators/limit.decorator';
import { Page } from 'src/utils/decorators/page.decorator';
import { Sort } from 'src/utils/decorators/sort.decorator';
import { User } from 'src/utils/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CreateOrderTourDto } from './dto/create-order-tour.dto';
import { OrderTourService } from './order-tour.service';

@ApiTags('Order Tour')
@Controller('order-tours')
export class OrderTourController {
  constructor(private orderTourService: OrderTourService) {}

  /**
   * --------------------------------------------------------
   * Post /order-tours
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت سفارش تور جدید توسط نقش هایی با سطح دسترسی ADD_ORDER_TOUR <br> (مثلا کارمند آژانس)<br>درصورت وجود داشتن فاکتور، آپدیت فاکتور انجام می شود</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_ORDER_TOUR)
  @ApiQuery({ name: 'tourism_level_id', required: false })
  async createOrderTour(
    @User('id') userId: number,
    @User('tourismId') tourismId: number,
    @Body() dto: CreateOrderTourDto,
    @Query('tourism_level_id') tourismLevelId,
  ) {
    const newOrder = await this.orderTourService.createOrderTour(
      userId,
      dto,
      tourismId,
      tourismLevelId,
    );

    return successfulResult(
      ['رزرو تور مشتری مورد نظر شما با موفقیت ثبت شد'],
      newOrder,
    );
  }

  /**
   * -------------------------------------------------------
   * GET /order-tours
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده سفارش های تور، توسط نقش هایی با سطح دسترسی GET_ORDER_TOUR (مثلا ادمین) </p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_ORDER_TOUR,
    PermissionsType.GET_FINANCIAL_INFO_TOUR,
  )
  @ApiQuery({ name: 'invoice_id', required: false })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'tour_id', required: false })
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
      ['tourism_id', 'tourismId'],
      ['invoice_id', 'invoiceId'],
      ['tour_id', 'tourId'],
      ['check_in', 'checkIn'],
      ['check_out', 'checkOut'],
      ['availability_status', 'orderMapRooms.availabilityStatus'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
    @User('tourismId') tourismId,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TOUR) canGetFinancialInfo,
  ) {
    const data = await this.orderTourService.getOrders(
      page,
      limit,
      filters,
      sorts,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /order-tours/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده جزئیات یک سفارش تور خاص، توسط نقش هایی با سطح دسترسی GET_ORDER_TOUR (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_ORDER_TOUR,
    PermissionsType.GET_FINANCIAL_INFO_TOUR,
  )
  async getOrderTourById(
    @Param('id') orderTourId: number,
    @User('tourismId') tourismId: number,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TOUR) canGetFinancialInfo,
  ) {
    const data = await this.orderTourService.getOrderTourById(
      orderTourId,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * DELETE /order-tours/1
   */
  @Delete(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف یک سفارش تور، توسط نقش هایی با سطح دسترسی DELETE_ORDER_TOUR <br> (مثلا ادمین یا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_ORDER_TOUR)
  async deleteOrder(
    @User('tourismId') tourismId: number,
    @Param('id') orderTourId: number,
  ) {
    await this.orderTourService.deleteOrder(orderTourId, tourismId);
    return successfulResult(['سفارش تور موردنظر، باموفقیت حذف شد']);
  }
}
