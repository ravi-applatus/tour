import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { Access } from 'src/utils/decorators/access.decorator';
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
import { CreateTourFeatureDto } from './dto/create-tour-feature.dto';
import { CreateTourImageDto } from './dto/create-tour-image.dto';
import { CreateTourDto } from './dto/create-tour.dto';
import { SingleFeatureToTourDto } from './dto/link-tour-single-feature.dto';
import { UpdateContentTourDto } from './dto/update-content-tour.dto';
import { UpdatePriceTourDto } from './dto/update-price-tour.dto';
import { UpdateTourFeatureDto } from './dto/update-tour-feature.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { TourService } from './tour.service';
import { UpdateTourBrochureDto } from './dto/update-tour-brochure.dto';

@ApiTags('Tour')
@Controller('tours')
export class TourController {
  constructor(private tourService: TourService) {}

  /**
   * -------------------------------------------------------
   * POST /tours/images
   * add new tour-image
   */
  @Post('/image')
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت عکس جدید برای تور، توسط نقش هایی با سطح دسترسی ADD_TOUR <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_TOUR)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions('tours')))
  async addTourImage(@Body() dto: CreateTourImageDto, @UploadedFile() file) {
    const newImage = await this.tourService.addTourImage(dto, file);
    return successfulResult(
      ['عکس جدید برای تور موردنظر، باموفقیت اضافه شد'],
      newImage,
    );
  }

  /**
   * -------------------------------------------------------
   * POST /tours/feature
   * add new feature for tour
   */
  @Post('/feature')
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت ویژگی جدید برای تور، توسط نقش هایی با سطح دسترسی ADD_TOUR_FEATURE <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_TOUR_FEATURE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('icon', multerOptions('tours')))
  async addTourFeature(
    @Body() dto: CreateTourFeatureDto,
    @UploadedFile() icon,
  ) {
    const newFeature = await this.tourService.addTourFeature(dto, icon);
    return successfulResult(['ویژگی جدید، باموفقیت اضافه شد'], newFeature);
  }

  /**
   * -------------------------------------------------------
   * POST /tours
   * add new tour
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت تور جدید توسط نقش هایی با سطح دسترسی ADD_TOUR <br> (مثلا مدیر یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_TOUR)
  async addTour(@User('id') userId, @Body() dto: CreateTourDto) {
    const newTour = await this.tourService.addTour(userId, dto);
    return successfulResult(['تور جدید باموفقیت اضافه شد'], newTour);
  }

  /**
   * -------------------------------------------------------
   * GET /tours/mappings/feature
   */
  @Get('/mappings/feature')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده ویژگی‌های یک تور، توسط نقش هایی با سطح دسترسی GET_TOUR_FEATURE</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOUR_FEATURE)
  @ApiQuery({ name: 'tour_id', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getHotelMappingFeatures(
    @Page() page,
    @Limit() limit,
    @Sort() sorts,
    @Filter([
      ['tour_id', 'tourId'],
      ['title', 'tourFeature.title'],
    ])
    filters,
  ) {
    const data = await this.tourService.getTourMappingFeatures(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tours/feature
   */
  @Get('/feature')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده ویژگی ها، توسط نقش هایی با سطح دسترسی GET_TOUR_FEATURE</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOUR_FEATURE)
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  async getTourFeatures(@Page() page, @Limit(50) limit) {
    const data = await this.tourService.getTourFeatures(page, limit);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tours
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات تور ها، توسط نقش هایی با سطح دسترسی GET_TOUR</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_TOUR,
    PermissionsType.GET_FINANCIAL_INFO_TOUR,
  )
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'origin_city', required: false })
  @ApiQuery({ name: 'origin_country', required: false })
  @ApiQuery({ name: 'destination_city', required: false })
  @ApiQuery({ name: 'destination_country', required: false })
  @ApiQuery({ name: 'tourism_level_id', required: false })
  @ApiQuery({ name: 'availability_count', required: false })
  @ApiQuery({ name: 'reserved_count', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({
    name: 'date',
    required: false,
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getTours(
    @User('tourismId') tourismId,
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'name',
      ['destination_city', 'destinationCity'],
      ['destination_country', 'destinationCountry'],
      ['reserved_count', 'reservedCount'],
      'from',
      'to',
      'status',
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
    @Query('tourism_level_id') tourismLevelId,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TOUR) canGetFinancialInfo,
  ) {
    const data = await this.tourService.getTours(
      page,
      limit,
      filters,
      tourismLevelId,
      sorts,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tours/feature/1
   */
  @Get('/feature/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده یک ویژگی خاص، توسط نقش هایی با سطح دسترسی GET_TOUR_FEATURE</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOUR_FEATURE)
  async getTourFeatureById(@Param('id') featureId: number) {
    const data = await this.tourService.getTourFeatureById(featureId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tours/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک تور خاص، توسط نقش هایی با سطح دسترسی GET_TOUR</p>',
  })
  @ApiQuery({ name: 'tourism_level_id', required: false })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_TOUR,
    PermissionsType.GET_FINANCIAL_INFO_TOUR,
  )
  async getTourById(
    @Param('id') tourId: number,
    @Query('tourism_level_id') tourismLevelId,
    @User('tourismId') tourismId: number,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TOUR) canGetFinancialInfo,
  ) {
    const data = await this.tourService.getTourById(
      tourId,
      tourismLevelId,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /tours/prices/1
   */
  @Get('prices/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده لیست قیمت های یک تور برای تمام سطوح، توسط نقش هایی با سطح دسترسی GET_TOUR_PRICE</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_TOUR_PRICE)
  async getTourPrices(
    @Param('id') tourId: number,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TOUR) canGetFinancialInfo,
  ) {
    const data = await this.tourService.getTourPrices(
      tourId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * update /tours/price
   * update price of tour
   */
  @Put('/price')
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت/ ویرایش قیمت، برای تور، توسط نقش هایی با سطح دسترسی UPDATE_PRICE_TOUR (مثلا ادمین یا کارشناس فروش)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_PRICE_TOUR)
  async addPrice(@Body() dto: UpdatePriceTourDto) {
    const price = await this.tourService.addPrice(dto);
    return successfulResult(
      ['قیمت برای تور موردنظر، باموفقیت آپدیت شد'],
      price,
    );
  }

  /**
   * -------------------------------------------------------
   * PUT /tours/content/1
   */
  @Put('/content/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات تور توسط کارشناس تولید محتوا با سطح دسترسی UPDATE_CONTENT_TOUR <br> (بجز تغییر موجودی تور)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_CONTENT_TOUR)
  async updateContentTour(
    @Param('id') tourId: number,
    @Body() dto: UpdateContentTourDto,
  ) {
    await this.tourService.updateContentTour(tourId, dto);
    return successfulResult(['اطلاعات تور موردنظر با موفقیت ویرایش شد']);
  }

  // /**
  //  * -------------------------------------------------------
  //  * PUT /tours/availability/1
  //  */
  // @Put('availability/:id')
  // @ApiOperation({
  //   description:
  //     '<p dir="rtl">ویرایش موجودی تور، توسط ادمین یا کارشناس فروش، با سطح دسترسی UPDATE_AVAILABILITY_TOUR</p>',
  // })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @Permissions(PermissionsType.UPDATE_AVAILABILITY_TOUR)
  // async updateAvailabilityTour(
  //   @Param('id') tourId: number,
  //   @Body() dto: UpdateAvailabilityTourDto,
  // ) {
  //   await this.tourService.updateAvailabilityTour(tourId, dto);
  //   return successfulResult(['موجودی تور موردنظر با موفقیت ویرایش شد']);
  // }

  /**
   * -------------------------------------------------------
   * PUT /tours/feature/1
   */
  @Put('/feature/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش یک ویژگی، توسط نقش هایی با سطح دسترسی UPDATE_TOUR_FEATURE </p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_TOUR_FEATURE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('icon', multerOptions('tours')))
  async updateTourFeature(
    @Param('id') featureId: number,
    @Body() dto: UpdateTourFeatureDto,
    @UploadedFile() icon,
  ) {
    await this.tourService.updateTourFeature(featureId, dto, icon);
    return successfulResult(['ویژگی موردنظر، با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /tours/brochure
   */
  @Put('/brochure')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_CONTENT_TOUR, PermissionsType.ADD_TOUR)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerOptions('tours', ['jpg', 'jpeg', 'png', 'pdf']),
    ),
  )
  async addUpdateBrochure(
    @Body() dto: UpdateTourBrochureDto,
    @UploadedFile() file,
  ) {
    await this.tourService.addUpdateBrochure(dto.tourId, file);
    return successfulResult(['فایل بروشور تور با موفقیت اضافه/ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT tours/:id/feature/single
   */
  @Put(':id/feature/single')
  @ApiOperation({
    description:
      '<p dir="rtl">تخصیص دادن یک ویژگی، به یک تور خاص، توسط نقش هایی با سطح دسترسی های ADD_TOUR، UPDATE_TOUR و UPDATE_CONTENT_TOUR <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.ADD_TOUR,
    PermissionsType.UPDATE_TOUR,
    PermissionsType.UPDATE_CONTENT_TOUR,
  )
  async updateLinkPermission(
    @Body() dto: SingleFeatureToTourDto,
    @Param('id') tourId: number,
  ) {
    await this.tourService.linkSingleFeatureToTour(tourId, dto);

    return successfulResult([
      ' ویژگی موردنظر، برای این تور، باموفقیت آپدیت شد',
    ]);
  }

  /**
   * -------------------------------------------------------
   * PUT /tours/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش تور، توسط نقش هایی با سطح دسترسی UPDATE_TOUR <br> (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_TOUR)
  async updateTour(@Param('id') tourId: number, @Body() dto: UpdateTourDto) {
    await this.tourService.updateTour(tourId, dto);
    return successfulResult(['تور موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * DELETE /tours/images/1
   */
  @Delete('/images/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف عکس تور، توسط نقش هایی با سطح دسترسی DELETE_TOUR_IMAGE <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_TOUR_IMAGE)
  async deleteImageById(@Param('id') imageId: number) {
    await this.tourService.deleteImageById(imageId);
    return successfulResult(['عکس موردنظر باموفقیت حذف شد']);
  }

  /**
   * -------------------------------------------------------
   * DELETE /tours/feature/1
   */
  @Delete('/feature/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف یک ویژگی، توسط نقش هایی با سطح دسترسی DELETE_TOUR_FEATURE <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_TOUR_FEATURE)
  async deleteFeatureById(@Param('id') featureId: number) {
    await this.tourService.deleteFeatureById(featureId);
    return successfulResult(['ویژگی موردنظر، باموفقیت حذف شد']);
  }
}
