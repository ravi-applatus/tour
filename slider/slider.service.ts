import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from 'src/utils';
import { Repository } from 'typeorm';
import { TourismService } from '../tourism/tourism.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { SliderEntity } from './entities/slider.entity';

@Injectable()
export class SliderService {
  constructor(
    @InjectRepository(SliderEntity)
    private sliderRepository: Repository<SliderEntity>,

    private error: ErrorService,
    private tourismService: TourismService,
  ) {}

  /**
   * -------------------------------------------------------
   * POST /sliders
   */
  async addSlider(dto: CreateSliderDto, file: Express.Multer.File) {
    const pathFile = `/sliders/${file.filename}`;

    const { identifiers } = await this.sliderRepository
      .createQueryBuilder()
      .insert()
      .values({ ...dto, pathFile, createdAt: new Date() })
      .execute();

    const newOfferId = identifiers[0].id;
    return await this.sliderRepository.findOne(newOfferId);
  }

  /**
   * -------------------------------------------------------
   * GET /sliders
   */
  async getSliders(page = 1, limit = 20, filters = null, sorts = null) {
    let builder = this.sliderRepository
      .createQueryBuilder('slider')
      .leftJoin('slider.level', 'level')
      .select([
        'slider.id',
        'slider.from',
        'slider.to',
        'slider.pathFile',
        'slider.isActive',

        'level.id',
        'level.name',
      ]);

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('slider.id', 'DESC');
    }

    const [items, totalItems] = await builder
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return {
      items,
      pagination: paginationResult(page, limit, totalItems),
    };
  }

  /**
   * -------------------------------------------------------
   * GET /sliders/by-tourism
   */
  async getSliderByTourism(tourismId: number) {
    const builder = this.sliderRepository
      .createQueryBuilder('slider')
      .leftJoin('slider.level', 'level')
      .select([
        'slider.id',
        'slider.from',
        'slider.to',
        'slider.pathFile',
        'slider.isActive',

        'level.id',
        'level.name',
      ]);

    if (tourismId) {
      const { levelId } = await this.tourismService.getRecordByTourismId(
        tourismId,
      );

      builder.andWhere('(slider.levelId = :levelId OR levelId IS NULL)', {
        levelId,
      });
    }

    builder.andWhere(
      '((NOW() BETWEEN slider.from AND slider.to) OR slider.from IS NULL)',
    );
    builder.andWhere('slider.isActive = 1');
    return await builder.getMany();
  }

  /**
   * -------------------------------------------------------
   * GET /sliders/1
   */
  async getSliderById(sliderId: number) {
    const builder = this.sliderRepository
      .createQueryBuilder('slider')
      .leftJoin('slider.level', 'level')
      .select([
        'slider.id',
        'slider.from',
        'slider.to',
        'slider.pathFile',
        'slider.isActive',

        'level.id',
        'level.name',
      ]);

    return await builder.where({ id: sliderId }).getOne();
  }

  /**
   * -------------------------------------------------------
   * DELETE /sliders/1
   */
  async deleteSliderById(sliderId: number) {
    return await this.sliderRepository
      .createQueryBuilder()
      .delete()
      .where({ id: sliderId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * UPDATE /sliders/1
   */
  async updateSlider(sliderId: number, dto: UpdateSliderDto) {
    return await this.sliderRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: sliderId })
      .execute();
  }
}
