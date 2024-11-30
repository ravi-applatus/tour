import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from 'src/utils';
import { In, Repository } from 'typeorm';
import { TourismService } from '../tourism/tourism.service';
import { CreateTourFeatureDto } from './dto/create-tour-feature.dto';
import { CreateTourImageDto } from './dto/create-tour-image.dto';
import { CreateTourDto } from './dto/create-tour.dto';
import { SingleFeatureToTourDto } from './dto/link-tour-single-feature.dto';
// import { UpdateAvailabilityTourDto } from './dto/update-availability-tour.dto';
import { UpdateContentTourDto } from './dto/update-content-tour.dto';
import { UpdatePriceTourDto } from './dto/update-price-tour.dto';
import { UpdateTourFeatureDto } from './dto/update-tour-feature.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { TourFeatureEntity } from './entities/tour-feature.entity';
import { TourImageEntity } from './entities/tour-image.entity';
import { TourMapFeatureEntity } from './entities/tour-map-feature.entity';
import { TourPriceEntity } from './entities/tour-price.entity';
import { TourEntity, TourStatus } from './entities/tour.entity';
import { TourChildPriceEntity } from './entities/tour-child-price.entity';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(TourEntity)
    private tourRepository: Repository<TourEntity>,

    @InjectRepository(TourPriceEntity)
    private tourPriceRepository: Repository<TourPriceEntity>,

    @InjectRepository(TourImageEntity)
    private tourImageRepository: Repository<TourImageEntity>,

    @InjectRepository(TourMapFeatureEntity)
    private tourMapFeatureRepository: Repository<TourMapFeatureEntity>,

    @InjectRepository(TourFeatureEntity)
    private tourFeatureRepository: Repository<TourFeatureEntity>,

    @InjectRepository(TourChildPriceEntity)
    private tourChildPriceRepository: Repository<TourChildPriceEntity>,

    private error: ErrorService,
    private tourismService: TourismService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /tours
   */
  async getTours(
    page = 1,
    limit = 20,
    filters = null,
    tourismLevelId = null,
    sorts = null,
    tourismId = null,
    canGetFinancialInfo = false,
  ) {
    let builder = this.tourRepository
      .createQueryBuilder('tour')
      .leftJoinAndSelect('tour.cover', 'cover')
      .leftJoinAndSelect('tour.images', 'images');

    // For tourism manager and employee
    if (tourismId || tourismLevelId) {
      builder.andWhere('tour.status = :status', {
        status: TourStatus.verified,
      });

      let levelId = tourismLevelId;
      if (tourismId) {
        ({ levelId } = await this.tourismService.getRecordByTourismId(
          tourismId,
        )); // 1
      }

      builder.innerJoin('tour.prices', 'prices', 'prices.levelId = :levelId', {
        levelId,
      });
      builder.leftJoin('prices.childPrices', 'childPrices');

      builder.addSelect([
        'prices.id',
        'prices.price',
        'prices.levelId',
        'prices.tourId',
        'childPrices.id',
        'childPrices.ageFrom',
        'childPrices.ageTo',
        'childPrices.price',
      ]);

      if (canGetFinancialInfo) {
        builder.addSelect('prices.buyPrice');
        builder.addSelect('childPrices.buyPrice');
      }
    }

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('tour.createdAt', 'DESC');
    }

    const [items, totalItems] = await builder
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    const tours: any = items;

    return {
      items: tours,
      pagination: paginationResult(page, limit, totalItems),
    };
  }

  /**
   * -------------------------------------------------------
   * GET /tours/1
   */
  async getTourById(
    tourId: number,
    tourismLevelId = null,
    tourismId: number = null,
    canGetFinancialInfo = false,
  ) {
    const builder = this.tourRepository
      .createQueryBuilder('tour')
      .leftJoinAndSelect('tour.cover', 'cover')
      .leftJoinAndSelect('tour.images', 'images')
      .leftJoinAndSelect('tour.tourMapFeatures', 'tourMapFeatures')
      .leftJoinAndSelect('tourMapFeatures.tourFeature', 'tourFeature');

    // For tourism manager and employee
    if (tourismId || tourismLevelId) {
      builder.andWhere('tour.status = :status', {
        status: TourStatus.verified,
      });

      let levelId = tourismLevelId;
      if (tourismId) {
        ({ levelId } = await this.tourismService.getRecordByTourismId(
          tourismId,
        )); // 1
      }

      builder.innerJoin('tour.prices', 'prices', 'prices.levelId = :levelId', {
        levelId,
      });

      builder.addSelect([
        'prices.id',
        'prices.price',
        'prices.levelId',
        'prices.tourId',
      ]);

      if (canGetFinancialInfo) {
        builder.addSelect(['prices.buyPrice']);
      }
    }

    return await builder.andWhere({ id: tourId }).getOne();
  }

  /**
   * -------------------------------------------------------
   * POST /tours
   * add new tour
   */
  async addTour(userId: number, dto: CreateTourDto) {
    const { identifiers } = await this.tourRepository
      .createQueryBuilder()
      .insert()
      .values({
        ...dto,
        status: TourStatus.new,
        userId,
        createdAt: new Date(),
      })
      .execute();

    const newTourId = identifiers[0].id;
    return await newTourId;
  }

  /**
   * -------------------------------------------------------
   * PUT /tours/1
   */
  async updateTour(tourId: number, dto: UpdateTourDto) {
    return await this.tourRepository
      .createQueryBuilder()
      .update()
      .set({ ...dto, updatedAt: new Date() })
      .where({ id: tourId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * PUT /tours/content/1
   */
  async updateContentTour(tourId: number, dto: UpdateContentTourDto) {
    const data = await this.tourRepository.findOne(tourId);

    if (data.status === TourStatus.inactive) {
      this.error.unprocessableEntity([
        'امکان ویرایش اطلاعات تور غیرفعال وجود ندارد',
      ]);
    }

    return await this.tourRepository
      .createQueryBuilder()
      .update()
      .set({ ...dto, updatedAt: new Date(), status: TourStatus.updated })
      .where({ id: tourId })
      .execute();
  }

  // /**
  //  * -------------------------------------------------------
  //  * PUT /tours/availability/1
  //  */
  // async updateAvailabilityTour(tourId: number, dto: UpdateAvailabilityTourDto) {
  //   return await this.tourRepository
  //     .createQueryBuilder()
  //     .update()
  //     .set({ ...dto, reservedCount: 0 })
  //     .where({ id: tourId })
  //     .execute();
  // }

  /**
   * -------------------------------------------------------
   * POST /tours/images
   * add new image for tour
   */

  async addTourImage(dto: CreateTourImageDto, file: Express.Multer.File) {
    const { identifiers } = await this.tourImageRepository
      .createQueryBuilder()
      .insert()
      .values({ ...dto, pathFile: `/tours/${file.filename}` })
      .execute();

    const newImageId = identifiers[0].id;
    return await this.tourImageRepository.findOne(newImageId);
  }

  /**
   * -------------------------------------------------------
   * DELETE /tours/images/1
   */
  async deleteImageById(imageId: number) {
    try {
      return await this.tourImageRepository
        .createQueryBuilder()
        .delete()
        .where({ id: imageId })
        .execute();
    } catch (e) {
      this.error.methodNotAllowed([
        'امکان حذف این عکس به دلیل اینکه عکس کاور تور است، وجود ندارد ',
      ]);
    }
  }

  /**
   * -------------------------------------------------------
   * PUT /tours/price/1
   * update price of tour
   */
  async addPrice(dto: UpdatePriceTourDto) {
    let foundPrice = await this.tourPriceRepository.findOne({
      levelId: dto.levelId,
      tourId: dto.tourId,
    });

    if (foundPrice) {
      foundPrice.price = dto.price;
      foundPrice.buyPrice = dto.buyPrice;
      await foundPrice.save();
    } else {
      const { identifiers } = await this.tourPriceRepository
        .createQueryBuilder()
        .insert()
        .values(dto)
        .execute();

      const priceId = identifiers[0].id;
      foundPrice = await this.tourPriceRepository.findOne(priceId);
    }

    // remove olds child prices
    await this.tourChildPriceRepository.delete({
      tourPriceId: foundPrice.id,
    });

    // add child prices
    if (dto.childPrices?.length > 0) {
      // add news
      await this.tourChildPriceRepository
        .createQueryBuilder()
        .insert()
        .values(
          dto.childPrices.map((p) => ({ ...p, tourPriceId: foundPrice.id })),
        )
        .execute();
    }

    return foundPrice;
  }

  /**
   * -------------------------------------------------------
   * GET /tours/mappings/feature
   */
  async getTourMappingFeatures(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
  ) {
    let builder = this.tourMapFeatureRepository
      .createQueryBuilder('mapping')
      .innerJoinAndSelect('mapping.tourFeature', 'tourFeature');

    builder = applyFiltersToBuilder(builder, filters);

    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('mapping.id', 'DESC');
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
   * POST features
   */
  async addTourFeature(dto: CreateTourFeatureDto, icon: Express.Multer.File) {
    if (icon) {
      dto.icon = `/tours/${icon.filename}`;
    }

    const { identifiers } = await this.tourFeatureRepository
      .createQueryBuilder()
      .insert()
      .values(dto)
      .execute();

    const newFeatureId = identifiers[0].id;
    return await this.tourFeatureRepository.findOne(newFeatureId);
  }

  /**
   * -------------------------------------------------------
   * GET /tours/features
   */
  async getTourFeatures(page = 1, limit = 20) {
    const builder = this.tourFeatureRepository.createQueryBuilder('feature');

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
   * GET /tours/feature/1
   */
  async getTourFeatureById(featureId: number) {
    return await this.tourFeatureRepository.findOne(featureId);
  }

  /**
   * -------------------------------------------------------
   * GET /tours/prices/1
   * show all prices for all levels
   */
  async getTourPrices(tourId: number, canGetFinancialInfo = false) {
    const builder = this.tourPriceRepository
      .createQueryBuilder('prices')
      .andWhere({ tourId })
      .select([
        'prices.id',
        'prices.tourId',
        'prices.levelId',
        'prices.price',
        'childPrices.id',
        'childPrices.ageFrom',
        'childPrices.ageTo',
        'childPrices.price',
      ])
      .leftJoin('prices.childPrices', 'childPrices');

    if (canGetFinancialInfo) {
      builder.addSelect('prices.buyPrice');
      builder.addSelect('childPrices.buyPrice');
    }

    return await builder.getMany();
  }

  /**
   * -------------------------------------------------------
   * PUT /tours/feature/1
   */
  async updateTourFeature(
    featureId: number,
    dto: UpdateTourFeatureDto,
    icon: Express.Multer.File,
  ) {
    if (icon) {
      dto.icon = `/tours/${icon.filename}`;
    }
    return await this.tourFeatureRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: featureId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * PUT /tours/brochure
   */
  async addUpdateBrochure(tourId: number, file: Express.Multer.File) {
    return await this.tourRepository
      .createQueryBuilder()
      .update()
      .set({ brochureFile: `/tours/${file.filename}` })
      .where({ id: tourId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * DELETE /tours/feature/1
   */
  async deleteFeatureById(featureId: number) {
    try {
      return await this.tourFeatureRepository
        .createQueryBuilder()
        .delete()
        .where({ id: featureId })
        .execute();
    } catch (e) {
      this.error.methodNotAllowed([
        'امکان حذف این ویژگی، به دلیل تخصیص داده شدن، وجود ندارد',
      ]);
    }
  }

  /**
   * -------------------------------------------------------
   */
  async getTourRecordById(tourId: number) {
    return await this.tourRepository.findOne(tourId);
  }

  /**
   * -------------------------------------------------------
   */
  async getPriceById(tourId, tourismLevelId) {
    return await this.tourPriceRepository
      .createQueryBuilder('prices')
      .leftJoinAndSelect('prices.childPrices', 'childPrices')
      .andWhere({ tourId })
      .andWhere({ levelId: tourismLevelId })
      .getOne();
  }

  /**
   * -------------------------------------------------------
   */
  async getTourMapFeaturesByFeaturesId(featureIds: number[], tourId: number) {
    return await this.tourMapFeatureRepository.find({
      tourFeatureId: In(featureIds),
      tourId,
    });
  }

  /**
   * -------------------------------------------------------
   */
  async updateReservedCount(tourId: number, reservedCount: number) {
    await this.tourRepository
      .createQueryBuilder()
      .update()
      .set({ reservedCount })
      .where({ id: tourId })
      .execute();
  }

  /**
   * Linking a new feature to the tour
   * Unlinking the old feature from the tour
   */
  async linkSingleFeatureToTour(tourId: number, dto: SingleFeatureToTourDto) {
    const mappings = await this.tourMapFeatureRepository.find({
      tourId,
    });

    // Detecting the features that should be unlinked from the tour
    const existMapping = mappings.find(
      (mapping) => mapping.tourFeatureId === dto.featureId,
    );

    if (!existMapping && dto.type === 'link') {
      await this._addLinks(tourId, [dto]);
    }

    // updating the feature details
    if (existMapping && dto.type === 'link') {
      await this.tourMapFeatureRepository
        .createQueryBuilder()
        .update()
        .set({ isOptional: dto.isOptional, price: dto.price })
        .where({ tourId, tourFeatureId: dto.featureId })
        .execute();
    }

    if (existMapping && dto.type === 'unlink') {
      await this._deleteLinks([existMapping.id]);
    }
  }

  /**
   * -------------------------------------------------------
   */
  private async _addLinks(tourId: number, features: any[]) {
    if (features.length > 0) {
      return await this.tourMapFeatureRepository
        .createQueryBuilder()
        .insert()
        .values(
          features.map((feature) => ({
            tourId,
            tourFeatureId: feature.featureId,
            isOptional: feature.isOptional,
            price: feature.price,
          })),
        )
        .execute();
    }
  }

  /**
   * -------------------------------------------------------
   */
  private async _deleteLinks(mappingId: number[]) {
    if (mappingId.length > 0) {
      return await this.tourMapFeatureRepository
        .createQueryBuilder()
        .delete()
        // [1, 3, 4]
        // WHERE IN (1,3,4)
        .whereInIds(mappingId)
        .execute();
    }
  }
}
