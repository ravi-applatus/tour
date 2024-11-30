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
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateContentHotelDto } from './dto/update-content-hotel.dto';
import { HotelService } from './hotel.service';
import { CreateHotelImageDto } from './dto/create-hotel-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/utils/multer.options';
import { CreateHotelFeatureDto } from './dto/create-hotel-feature.dto';
import { UpdateHotelFeatureDto } from './dto/update-hotel-feature.dto';
import { SingleFeatureToHotelDto } from './dto/link-hotel-single-feature.dto';
import { CreateHotelVideoDto } from './dto/create-hotel-video.dto';

@ApiTags('Hotel')
@Controller('hotels')
export class HotelController {
  constructor(private hotelService: HotelService) {}

  /**
   * -------------------------------------------------------
   * POST /hotels/images
   * add new hotel-image
   */
  @Post('/image')
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت عکس جدید برای هتل، توسط نقش هایی با سطح دسترسی ADD_HOTEL <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_HOTEL)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions('hotels')))
  async addHotelImage(@Body() dto: CreateHotelImageDto, @UploadedFile() file) {
    const newImage = await this.hotelService.addHotelImage(dto, file);
    return successfulResult(
      ['عکس جدید برای هتل موردنظر باموفقیت اضافه شد'],
      newImage,
    );
  }

  /**
   * -------------------------------------------------------
   * POST /hotels/videos
   * add new hotel-video
   */
  @Post('/video')
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت ویدئوی جدید برای هتل، توسط نقش هایی با سطح دسترسی ADD_HOTEL <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_HOTEL)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerOptions(
        'hotels',
        ['mp4', 'mkv', 'avi', 'wmv', 'flv'],
        1024 * 1024 * 100,
      ),
    ),
  )
  async addHotlVideo(@Body() dto: CreateHotelVideoDto, @UploadedFile() file) {
    const newVideo = await this.hotelService.addHotlVideo(dto, file);
    return successfulResult(
      ['ویدئوی جدید برای هتل موردنظر باموفقیت اضافه شد'],
      newVideo,
    );
  }

  /**
   * -------------------------------------------------------
   * POST /hotels/feature
   * add new feature for hotel
   */
  @Post('/feature')
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت ویژگی جدید، توسط نقش هایی با سطح دسترسی ADD_HOTEL_FEATURE <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_HOTEL_FEATURE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('icon', multerOptions('hotels')))
  async addHotelFeature(
    @Body() dto: CreateHotelFeatureDto,
    @UploadedFile() icon,
  ) {
    const newFeature = await this.hotelService.addHotelFeature(dto, icon);
    return successfulResult(['ویژگی جدید، باموفقیت اضافه شد'], newFeature);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/mappings/feature
   */
  @Get('/mappings/feature')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده ویژگی‌های یک هتل، توسط نقش هایی با سطح دسترسی GET_HOTEL_FEATURE</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL_FEATURE)
  @ApiQuery({ name: 'hotel_id', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getHotelMappingFeatures(
    @Page() page,
    @Limit() limit,
    @Sort() sorts,
    @Filter([
      ['hotel_id', 'hotelId'],
      ['title', 'hotelFeature.title'],
    ])
    filters,
  ) {
    const data = await this.hotelService.getHotelMappingFeatures(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/feature
   */
  @Get('/feature')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده ویژگی ها، توسط نقش هایی با سطح دسترسی GET_HOTEL_FEATURE</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL_FEATURE)
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  async getHotelFeatures(@Page() page, @Limit(50) limit) {
    const data = await this.hotelService.getHotelFeatures(page, limit);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/feature/1
   */
  @Get('/feature/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده یک ویژگی خاص، توسط نقش هایی با سطح دسترسی GET_HOTEL_FEATURE</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL_FEATURE)
  async getHotelFeatureById(@Param('id') featureId: number) {
    const data = await this.hotelService.getHotelFeatureById(featureId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/video/1
   */
  @Get('video/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده یک ویدئو، توسط نقش هایی با سطح دسترسی GET_HOTEL (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL)
  async getVideoById(@Param('id') videoId: number) {
    const data = await this.hotelService.getVideoById(videoId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * PUT /hotels/feature/1
   */
  @Put('/feature/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش یک ویژگی، توسط نقش هایی با سطح دسترسی UPDATE_HOTEL_FEATURE </p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_HOTEL_FEATURE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('icon', multerOptions('hotels')))
  async updateHotelFeature(
    @Param('id') featureId: number,
    @Body() dto: UpdateHotelFeatureDto,
    @UploadedFile() icon,
  ) {
    await this.hotelService.updateHotelFeature(featureId, dto, icon);
    return successfulResult(['ویژگی موردنظر، با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * DELETE /hotels/feature/1
   */
  @Delete('/feature/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف یک ویژگی، توسط نقش هایی با سطح دسترسی DELETE_HOTEL_FEATURE <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_HOTEL_FEATURE)
  async deleteFeatureById(@Param('id') featureId: number) {
    await this.hotelService.deleteFeatureById(featureId);
    return successfulResult(['ویژگی موردنظر، باموفقیت حذف شد']);
  }

  /**
   * -------------------------------------------------------
   * DELETE /hotels/images/1
   */
  @Delete('/images/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف عکس هتل، توسط نقش هایی با سطح دسترسی DELETE_HOTEL_VIDEO <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_HOTEL_IMAGE)
  async deleteImageById(@Param('id') imageId: number) {
    await this.hotelService.deleteImageById(imageId);
    return successfulResult(['عکس موردنظر باموفقیت حذف شد']);
  }

  /**
   * -------------------------------------------------------
   * DELETE /hotels/videos/1
   */
  @Delete('/videos/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف ویدئوی هتل، توسط نقش هایی با سطح دسترسی DELETE_HOTEL_VIDEO <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_HOTEL_VIDEO)
  async deleteVideoById(@Param('id') videoId: number) {
    await this.hotelService.deleteVideoById(videoId);
    return successfulResult(['ویدئوی موردنظر باموفقیت حذف شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /hotels/content/1
   */
  @Put('/content/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات هتل توسط کارشناس تولید محتوا با سطح دسترسی UPDATE_CONTENT_HOTEL <br> (بجز تغییر وضعیت هتل)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_CONTENT_HOTEL)
  async updateContentHotel(
    @Param('id') hotelId: number,
    @Body() dto: UpdateContentHotelDto,
  ) {
    await this.hotelService.updateContentHotel(hotelId, dto);
    return successfulResult(['اطلاعات هتل موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات هتل ها، توسط نقش هایی با سطح دسترسی GET_HOTEL <br> (دقت شود که اطلاعات قابل نمایش برای آژانس، فقط هتل های تأیید شده توسط مدیر، با وضعیت verified می باشد.)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL)
  @ApiQuery({ name: 'name', required: false, description: 'e.g. like:%آپا%' })
  @ApiQuery({ name: 'star', required: false })
  @ApiQuery({ name: 'address', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'tourism_level_id', required: false })
  @ApiQuery({ name: 'count_passanger', required: false, description: 'e.g. 2' })
  @ApiQuery({ name: 'check_in', required: false })
  @ApiQuery({ name: 'check_out', required: false })
  @ApiQuery({ name: 'room_name', required: false })
  @ApiQuery({ name: 'room_type', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getHotels(
    @User('tourismId') tourismId,
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'name',
      'star',
      'address',
      'email',
      'country',
      'city',
      'status',
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
    @Query('count_passanger') countPassanger,
    @Query('tourism_level_id') tourismLevelId,
    @Query('check_in') checkIn,
    @Query('check_out') checkOut,
    @Query('room_name') roomName,
    @Query('room_type') roomType,
  ) {
    const data = await this.hotelService.getHotels(
      page,
      limit,
      filters,
      countPassanger,
      tourismLevelId,
      sorts,
      tourismId,
      checkIn,
      checkOut,
      roomName,
      roomType,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/videos
   */
  @Get('videos')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده ویدئوهای هتل، توسط نقش هایی با سطح دسترسی GET_HOTEL (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL)
  async getVideos() {
    const data = await this.hotelService.getVideos();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک هتل خاص، توسط نقش هایی با سطح دسترسی GET_HOTEL <br> (دقت شود که سطح دسترسی آژانس، فقط اجازه مشاهده هتلی که وضعیتش توسط مدیر تأیید شده (verified) را دارد)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_HOTEL)
  async getHotelById(
    @Param('id') hotelId: number,
    @User('tourismId') tourismId: number,
  ) {
    const data = await this.hotelService.getHotelById(hotelId, tourismId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * POST /hotels
   * add new hotel
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت هتل جدید توسط نقش هایی با سطح دسترسی ADD_HOTEL <br> (مثلا مدیر یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_HOTEL)
  async addHotel(@User('id') userId, @Body() dto: CreateHotelDto) {
    const newHotel = await this.hotelService.addHotel(userId, dto);
    return successfulResult(['هتل جدید باموفقیت اضافه شد'], newHotel);
  }

  /**
   * -------------------------------------------------------
   * PUT /hotels/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات هتل، توسط نقش هایی با سطح دسترسی UPDATE_HOTEL <br> (مثلا ادمین ، که امکان تغییر وضعیت هتل را هم دارد.)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_HOTEL)
  async updateHotel(@Param('id') hotelId: number, @Body() dto: UpdateHotelDto) {
    await this.hotelService.updateHotel(hotelId, dto);
    return successfulResult(['هتل موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT hotels/:id/feature/single
   */
  @Put(':id/feature/single')
  @ApiOperation({
    description:
      '<p dir="rtl">تخصیص دادن یک ویژگی، به یک هتل خاص، توسط نقش هایی با سطح دسترسی های ADD_HOTEL، UPDATE_HOTEL و UPDATE_CONTENT_HOTEL <br> (مثلا ادمین یا کارشناس تولید محتوا)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.ADD_HOTEL,
    PermissionsType.UPDATE_HOTEL,
    PermissionsType.UPDATE_CONTENT_HOTEL,
  )
  async updateLinkPermission(
    @Body() dto: SingleFeatureToHotelDto,
    @Param('id') hotelId: number,
  ) {
    await this.hotelService.linkSingleFeatureToHotel(hotelId, dto);

    return successfulResult([
      ' ویژگی موردنظر، برای این هتل، باموفقیت آپدیت شد',
    ]);
  }
}
