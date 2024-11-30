import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'jalali-moment';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from 'src/utils';
import { In, Repository } from 'typeorm';
import { HotelRoomService } from '../hotel-room/hotel-room.service';
import { TourismService } from '../tourism/tourism.service';
import { CreateHotelFeatureDto } from './dto/create-hotel-feature.dto';
import { CreateHotelImageDto } from './dto/create-hotel-image.dto';
import { CreateHotelVideoDto } from './dto/create-hotel-video.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { SingleFeatureToHotelDto } from './dto/link-hotel-single-feature.dto';
import { UpdateContentHotelDto } from './dto/update-content-hotel.dto';
import { UpdateHotelFeatureDto } from './dto/update-hotel-feature.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelFeatureEntity } from './entities/hotel-feature.entity';
import { HotelImageEntity } from './entities/hotel-image.entity';
import { HotelMapFeatureEntity } from './entities/hotel-map-feature.entity';
import { HotelVideoEntity } from './entities/hotel-video.entity';
import { HotelEntity, HotelStatus } from './entities/hotel.entity';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(HotelEntity)
    private hotelRepository: Repository<HotelEntity>,

    @InjectRepository(HotelMapFeatureEntity)
    private hotelMapFeatureRepository: Repository<HotelMapFeatureEntity>,

    @InjectRepository(HotelFeatureEntity)
    private hotelFeatureRepository: Repository<HotelFeatureEntity>,

    @InjectRepository(HotelImageEntity)
    private hotelimageRepository: Repository<HotelImageEntity>,

    @InjectRepository(HotelVideoEntity)
    private hotelVideoRepository: Repository<HotelVideoEntity>,

    private error: ErrorService,
    private tourismService: TourismService,
    private hotelRoomService: HotelRoomService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /hotels
   */
  async getHotels(
    page = 1,
    limit = 20,
    filters = null,
    countPassanger = null,
    tourismLevelId = null,
    sorts = null,
    tourismId = null,
    checkIn = null,
    checkOut = null,
    roomName = null,
    roomType = null,
  ) {
    let builder = this.hotelRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.cover', 'cover')
      .leftJoinAndSelect('hotel.images', 'images')
      .leftJoinAndSelect('hotel.videos', 'videos')
      .leftJoinAndSelect('hotel.hotelMapFeatures', 'hotelMapFeatures')
      .leftJoinAndSelect('hotelMapFeatures.hotelFeature', 'hotelFeature');

    // For tourism manager and employee
    if (tourismId || tourismLevelId) {
      if (roomType && roomName) {
        builder.innerJoinAndSelect(
          'hotel.rooms',
          'rooms',
          'rooms.name = :roomName AND rooms.type = :roomType',
          { roomName, roomType },
        );
      } else {
        builder.innerJoin('hotel.rooms', 'rooms');
      }

      if (checkIn && checkOut) {
        builder.innerJoin(
          'rooms.availabilities',
          'availabilities',
          'availabilities.availabilityCount > availabilities.reservedCount AND availabilities.date >= :checkIn AND availabilities.date < :checkOut',
          { checkIn, checkOut },
        );
      } else {
        // today
        builder.innerJoin(
          'rooms.availabilities',
          'availabilities',
          'availabilities.availabilityCount > availabilities.reservedCount AND availabilities.date = :now',
          { now: moment().format('YYYY-MM-DD') },
        );
      }

      builder.andWhere('hotel.status = :status', {
        status: HotelStatus.verified,
      });

      if (countPassanger) {
        builder.andWhere('rooms.maxCapacity + rooms.maxExtraCapacity >= :cp', {
          cp: countPassanger,
        });
      }
    }

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('hotel.createdAt', 'DESC');
    }

    const [items, totalItems] = await builder
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    let hotels: any = items;

    // Fetching max and min price by tourism level
    if (items.length > 0 && (tourismId || tourismLevelId)) {
      let levelId = tourismLevelId;
      if (tourismId) {
        ({ levelId } = await this.tourismService.getRecordByTourismId(
          tourismId,
        ));
      }

      const hotelIds = items.map((item) => item.id); // [1, 4, 10]

      // [{hotelId: 1, maxPrice: 100, minPrice: 50}]
      const priceRanges = await this.priceRangeByLevel(
        hotelIds,
        levelId,
        countPassanger,
        checkIn,
        checkOut,
        roomType,
        roomName,
      );

      hotels = hotels.map((hotel) => ({
        ...hotel,
        ...(priceRanges?.[hotel.id] || {}),
      }));
    }

    return {
      items: hotels,
      pagination: paginationResult(page, limit, totalItems),
    };
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/1
   */
  async getHotelById(hotelId: number, tourismId: number = null) {
    const builder = this.hotelRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.cover', 'cover')
      .leftJoinAndSelect('hotel.images', 'images')
      .leftJoinAndSelect('hotel.videos', 'videos')
      .leftJoinAndSelect('hotel.hotelMapFeatures', 'hotelMapFeatures')
      .leftJoinAndSelect('hotelMapFeatures.hotelFeature', 'hotelFeature');

    // For tourism manager and employee
    if (tourismId) {
      builder.andWhere('hotel.status = :status', {
        status: HotelStatus.verified,
      });
    }

    return await builder.where({ id: hotelId }).getOne();
  }

  /**
   * -------------------------------------------------------
   * POST /hotels
   * add new hotel
   */

  async addHotel(userId: number, dto: CreateHotelDto) {
    const { identifiers } = await this.hotelRepository
      .createQueryBuilder()
      .insert()
      .values({
        ...dto,
        status: HotelStatus.new,
        userId,
        needOrderConfirmAvailability: false,
        createdAt: new Date(),
      })
      .execute();

    const newHotelId = identifiers[0].id;
    return await this.hotelRepository.findOne(newHotelId);
  }

  /**
   * -------------------------------------------------------
   * PUT /hotels/content/1
   */
  async updateContentHotel(hotelId: number, dto: UpdateContentHotelDto) {
    const data = await this.hotelRepository.findOne(hotelId);

    if (data.status === HotelStatus.inactive) {
      this.error.unprocessableEntity([
        'امکان ویرایش اطلاعات هتل غیرفعال وجود ندارد',
      ]);
    }

    return await this.hotelRepository
      .createQueryBuilder()
      .update()
      .set({ ...dto, updatedAt: new Date(), status: HotelStatus.updated })
      .where({ id: hotelId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * PUT /hotels/1
   */
  async updateHotel(hotelId: number, dto: UpdateHotelDto) {
    return await this.hotelRepository
      .createQueryBuilder()
      .update()
      .set({ ...dto, updatedAt: new Date() })
      .where({ id: hotelId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * POST /hotels/images
   * add new image for hotel
   */

  async addHotelImage(dto: CreateHotelImageDto, file: Express.Multer.File) {
    const { identifiers } = await this.hotelimageRepository
      .createQueryBuilder()
      .insert()
      .values({ ...dto, pathFile: `/hotels/${file.filename}` })
      .execute();

    const newImageId = identifiers[0].id;
    return await this.hotelimageRepository.findOne(newImageId);
  }

  /**
   * -------------------------------------------------------
   * DELETE /hotels/images/1
   */
  async deleteImageById(imageId: number) {
    const image = await this.hotelimageRepository.findOne(imageId);

    if (!image) {
      this.error.unprocessableEntity(['ویدیو مورد نظر یافت نشد']);
    }

    try {
      await this.hotelimageRepository
        .createQueryBuilder()
        .delete()
        .where({ id: imageId })
        .execute();

      fs.unlink(
        path.join(__dirname, '../../..', 'uploads', image.pathFile),
        (e) => console.log(e),
      );

      return true;
    } catch (e) {
      this.error.methodNotAllowed([
        'امکان حذف این عکس به دلیل اینکه عکس کاور هتل است، وجود ندارد ',
      ]);
    }
  }

  /**
   * -------------------------------------------------------
   * POST features
   */
  async addHotelFeature(dto: CreateHotelFeatureDto, icon: Express.Multer.File) {
    if (icon) {
      dto.icon = `/hotels/${icon.filename}`;
    }

    const { identifiers } = await this.hotelFeatureRepository
      .createQueryBuilder()
      .insert()
      .values(dto)
      .execute();

    const newFeatureId = identifiers[0].id;
    return await this.hotelFeatureRepository.findOne(newFeatureId);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/mappings/feature
   */
  async getHotelMappingFeatures(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
  ) {
    let builder = this.hotelMapFeatureRepository
      .createQueryBuilder('mapping')
      .innerJoinAndSelect('mapping.hotelFeature', 'hotelFeature');

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
   * GET /hotels/features
   */
  async getHotelFeatures(page = 1, limit = 20) {
    const builder = this.hotelFeatureRepository.createQueryBuilder('feature');

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
   * PUT /hotels/feature/1
   */
  async updateHotelFeature(
    featureId: number,
    dto: UpdateHotelFeatureDto,
    icon: Express.Multer.File,
  ) {
    if (icon) {
      dto.icon = `/hotels/${icon.filename}`;
    }
    return await this.hotelFeatureRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: featureId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * DELETE /hotels/feature/1
   */
  async deleteFeatureById(featureId: number) {
    try {
      return await this.hotelFeatureRepository
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
   * GET /hotels/feature/1
   */
  async getHotelFeatureById(featureId: number) {
    return await this.hotelFeatureRepository.findOne(featureId);
  }

  /**
   * -------------------------------------------------------
   * POST /hotels/videos
   * add new video for hotel
   */

  async addHotlVideo(dto: CreateHotelVideoDto, file: Express.Multer.File) {
    const { identifiers } = await this.hotelVideoRepository
      .createQueryBuilder()
      .insert()
      .values({ ...dto, pathFile: `/hotels/${file.filename}` })
      .execute();

    const newVideoId = identifiers[0].id;
    return await this.hotelVideoRepository.findOne(newVideoId);
  }

  /**
   * -------------------------------------------------------
   * DELETE /hotels/videos/1
   */
  async deleteVideoById(videoId: number) {
    const video = await this.hotelVideoRepository.findOne(videoId);

    if (!video) {
      this.error.unprocessableEntity(['ویدیو مورد نظر یافت نشد']);
    }

    fs.unlink(
      path.join(__dirname, '../../..', 'uploads', video.pathFile),
      (e) => console.log(e),
    );

    await this.hotelVideoRepository
      .createQueryBuilder()
      .delete()
      .where({ id: videoId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/video/1
   */
  async getVideoById(videoId: number) {
    return await this.hotelVideoRepository.findOne(videoId);
  }

  /**
   * -------------------------------------------------------
   * GET /hotels/videos
   */
  async getVideos() {
    const builder = this.hotelVideoRepository.createQueryBuilder();
    return await builder.getMany();
  }

  /**
   * -------------------------------------------------------
   */
  async getHotelMapFeaturesByFeaturesId(featureIds: number[], hotelId: number) {
    return await this.hotelMapFeatureRepository.find({
      hotelFeatureId: In(featureIds),
      hotelId,
    });
  }

  /**
   * Linking a new feature to the hotel
   * Unlinking the old feature from the hotel
   */
  async linkSingleFeatureToHotel(
    hotelId: number,
    dto: SingleFeatureToHotelDto,
  ) {
    const mappings = await this.hotelMapFeatureRepository.find({
      hotelId,
    });

    // Detecting the features that should be unlinked from the hotel
    const existMapping = mappings.find(
      (mapping) => mapping.hotelFeatureId === dto.featureId,
    );

    if (!existMapping && dto.type === 'link') {
      await this._addLinks(hotelId, [dto]);
    }

    // updating the feature details
    if (existMapping && dto.type === 'link') {
      await this.hotelMapFeatureRepository
        .createQueryBuilder()
        .update()
        .set({ isOptional: dto.isOptional, price: dto.price })
        .where({ hotelId, hotelFeatureId: dto.featureId })
        .execute();
    }

    if (existMapping && dto.type === 'unlink') {
      await this._deleteLinks([existMapping.id]);
    }
  }

  /**
   * -------------------------------------------------------
   */
  async getHotelRecordById(hoteId: number) {
    return await this.hotelRepository.findOne(hoteId);
  }

  /**
   * -------------------------------------------------------
   */
  private async _addLinks(hotelId: number, features: any[]) {
    if (features.length > 0) {
      return await this.hotelMapFeatureRepository
        .createQueryBuilder()
        .insert()
        .values(
          features.map((feature) => ({
            hotelId,
            hotelFeatureId: feature.featureId,
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
      return await this.hotelMapFeatureRepository
        .createQueryBuilder()
        .delete()
        // [1, 3, 4]
        // WHERE IN (1,3,4)
        .whereInIds(mappingId)
        .execute();
    }
  }

  /**
   * -------------------------------------------------------
   */
  private async priceRangeByLevel(
    hotelIds: number[],
    levelId: number,
    countPassanger = null,
    checkIn = null,
    checkOut = null,
    roomType = null,
    roomName = null,
  ) {
    const builder = this.hotelRepository
      .createQueryBuilder('hotel')
      .innerJoinAndSelect('hotel.rooms', 'rooms')
      .innerJoinAndSelect(
        'rooms.prices',
        'prices',
        'prices.levelId = :levelId AND (prices.from IS NULL OR prices.from <= :date AND prices.to > :date)',
        {
          levelId,
          date: moment(checkIn || new Date()).format('YYYY-MM-DD'),
        },
      )
      .andWhere('hotel.id IN (:...hotelIds)', { hotelIds });

    if (checkIn && checkOut) {
      builder.innerJoinAndSelect(
        'rooms.availabilities',
        'availabilities',
        'availabilities.availabilityCount > availabilities.reservedCount AND availabilities.date >= :checkIn AND availabilities.date < :checkOut',
        { checkIn, checkOut },
      );
    } else {
      // today
      builder.innerJoinAndSelect(
        'rooms.availabilities',
        'availabilities',
        'availabilities.availabilityCount > availabilities.reservedCount AND availabilities.date = :now',
        { now: moment().format('YYYY-MM-DD') },
      );
    }

    if (countPassanger) {
      builder.andWhere('rooms.maxCapacity + rooms.maxExtraCapacity >= :cp', {
        cp: countPassanger,
      });
    }
    if (roomType) {
      builder.andWhere('rooms.type = :roomType', { roomType });
    }
    if (roomName) {
      builder.andWhere('rooms.name = :roomName', { roomName });
    }

    const hotels = await builder.getMany();

    const finalList = {};

    hotels.forEach((hotel) => {
      const rooms = hotel.rooms.map((room) => {
        const prices = room.prices.map((price) => {
          let diffDays = 1000000;
          if (price.from) {
            diffDays = moment(price.to).diff(moment(price.from), 'days');
          }
          return { ...price, diffDays };
        });

        const roomPrice =
          prices.sort((a, b) => a.diffDays - b.diffDays)?.[0]?.price || 0;

        const allAvailability = room.availabilities.map(
          (availability) =>
            availability.availabilityCount - availability.reservedCount,
        );
        const availabilityRoom = Math.min(...allAvailability);

        return { ...room, price: roomPrice, availability: availabilityRoom };
      });

      const minAvailability = Math.min(...rooms.map((r) => r.availability));
      const minPriceRoom = Math.min(...rooms.map((r) => r.price));
      const maxPriceRoom = Math.max(...rooms.map((r) => r.price));

      finalList[hotel.id] = { minAvailability, minPriceRoom, maxPriceRoom };
    });

    return finalList;
  }
}
