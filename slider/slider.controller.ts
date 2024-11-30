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
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { successfulResult } from 'src/utils';
import { Filter } from 'src/utils/decorators/filter.decorator';
import { Limit } from 'src/utils/decorators/limit.decorator';
import { Page } from 'src/utils/decorators/page.decorator';
import { Sort } from 'src/utils/decorators/sort.decorator';
import { User } from 'src/utils/decorators/user.decorator';
import { multerOptions } from '../../utils/multer.options';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { SliderService } from './slider.service';

@ApiTags('Slider')
@Controller('sliders')
export class SliderController {
  constructor(private sliderService: SliderService) {}

  /**
   * -------------------------------------------------------
   * POST /sliders
   * add new slider
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_SLIDER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions('sliders')))
  async addSlider(@Body() dto: CreateSliderDto, @UploadedFile() file) {
    const newSlider = await this.sliderService.addSlider(dto, file);
    return successfulResult(['اسلایدر جدید باموفقیت اضافه شد'], newSlider);
  }

  /**
   * -------------------------------------------------------
   * GET /sliders
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_SLIDER)
  @ApiQuery({ name: 'from', required: false, description: 'e.g. like:%آپا%' })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'level_id', required: false })
  @ApiQuery({ name: 'is_active', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getSliders(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'from',
      'to',
      ['level_id', 'levelId'],
      ['is_active', 'isActive'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.sliderService.getSliders(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /sliders/by-tourism
   */
  @Get('by-tourism')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_SLIDER_BY_TOURISM)
  async getSliderByTourism(@User('tourismId') tourismId) {
    const data = await this.sliderService.getSliderByTourism(tourismId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /sliders/1
   */
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_SLIDER)
  async getSliderById(@Param('id') sliderId: number) {
    const data = await this.sliderService.getSliderById(sliderId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * DELETE /sliders/1
   */
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_SLIDER)
  async deleteSliderById(@Param('id') sliderId: number) {
    await this.sliderService.deleteSliderById(sliderId);
    return successfulResult(['اسلایدر موردنظر باموفقیت حذف شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /currency/1
   */
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_SLIDER)
  async updateCurrency(
    @Param('id') sliderId: number,
    @Body() dto: UpdateSliderDto,
  ) {
    await this.sliderService.updateSlider(sliderId, dto);
    return successfulResult(['اسلایدر مورد نظر با موفقیت ویرایش شد']);
  }
}
