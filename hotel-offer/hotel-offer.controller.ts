import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
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
import { CreateHotelOfferDto } from './dto/create-hotel-offer.dto';
import { UpdateHotelOfferDto } from './dto/update-hotel-offer.dto';
import { HotelOfferService } from './hotel-offer.service';

@ApiTags('Hotel Offer')
@Controller('hotel-offers')
export class HotelOfferController {
  constructor(private hotelOfferService: HotelOfferService) {}

  /**
   * -------------------------------------------------------
   * POST /hotel-offers
   * add new hotelOffer
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت پیشنهاد جدید توسط نقش هایی با سطح دسترسی ADD_HOTEL_OFFER (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_HOTEL_OFFER)
  async addHotelOffer(@Body() dto: CreateHotelOfferDto) {
    const newOffer = await this.hotelOfferService.addHotelOffer(dto);
    return successfulResult(['پیشنهاد جدید باموفقیت اضافه شد'], newOffer);
  }

  /**
   * -------------------------------------------------------
   * GET /hotel-offers
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده پیشنهادات هتل ها، توسط ادمین GET_HOTEL_OFFER</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL_OFFER)
  @ApiQuery({ name: 'from', required: false, description: 'e.g. like:%آپا%' })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'discount', required: false })
  @ApiQuery({ name: 'hotel_id', required: false })
  @ApiQuery({ name: 'level_id', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getHotelOffers(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'from',
      'to',
      'discount',
      ['hotel_id', 'hotelId'],
      ['level_id', 'levelId'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.hotelOfferService.getHotelOffers(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /hotel-offers/by-tourism
   */
  @Get('by-tourism')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده پیشنهادات هتل ها، توسط نقش هایی با سطح دسترسی GET_HOTEL_OFFER_BY_TOURISM (مثلا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL_OFFER_BY_TOURISM)
  async getHotelOffersByTourism(@User('tourismId') tourismId) {
    const data = await this.hotelOfferService.getHotelOffersByTourism(
      tourismId,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /hotel-offers/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک پیشنهاد خاص، توسط ادمین با سطح دسترسی GET_HOTEL_OFFER</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL_OFFER)
  async getHotelOfferById(@Param('id') hotelOfferId: number) {
    const data = await this.hotelOfferService.getHotelOfferById(hotelOfferId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * PUT /hotel-offers/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش یک پیشنهاد خاص، توسط نقش هایی با سطح دسترسی UPDATE_HOTEL_OFFER (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_HOTEL_OFFER)
  async updateHotelOffer(
    @Param('id') hotelOfferId: number,
    @Body() dto: UpdateHotelOfferDto,
  ) {
    await this.hotelOfferService.updateHotelOffer(hotelOfferId, dto);
    return successfulResult(['پیشنهاد موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * DELETE /hotel-offers/1
   */
  @Delete(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف یک پیشنهاد خاص، توسط نقش هایی با سطح دسترسی DELETE_HOTEL_OFFER(مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_HOTEL_OFFER)
  async deleteHotelOfferById(@Param('id') hotelOfferId: number) {
    await this.hotelOfferService.deleteHotelOfferById(hotelOfferId);
    return successfulResult(['پیشنهاد موردنظر باموفقیت حذف شد']);
  }
}
