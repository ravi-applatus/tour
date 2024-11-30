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
import { CreateHotelOfferDto } from './dto/create-hotel-offer.dto';
import { UpdateHotelOfferDto } from './dto/update-hotel-offer.dto';
import { HotelLevelOfferEntity } from './entities/hotel-level-offer.entity';

@Injectable()
export class HotelOfferService {
  constructor(
    @InjectRepository(HotelLevelOfferEntity)
    private hotelLevelOfferRepository: Repository<HotelLevelOfferEntity>,

    private error: ErrorService,
    private tourismService: TourismService,
  ) {}

  /**
   * -------------------------------------------------------
   * POST /hotel-offers
   * add new hotelOffer
   */

  async addHotelOffer(dto: CreateHotelOfferDto) {
    const { identifiers } = await this.hotelLevelOfferRepository
      .createQueryBuilder()
      .insert()
      .values({
        ...dto,
        isActive: true,
      })
      .execute();

    const newOfferId = identifiers[0].id;
    return await this.hotelLevelOfferRepository.findOne(newOfferId);
  }

  /**
   * -------------------------------------------------------
   * GET /hotel-offers
   */
  async getHotelOffers(page = 1, limit = 20, filters = null, sorts = null) {
    let builder = this.hotelLevelOfferRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.hotel', 'hotel')
      .leftJoin('hotel.cover', 'cover')
      .leftJoin('offer.level', 'level')
      .select([
        'offer.id',
        'offer.from',
        'offer.to',
        'offer.isActive',
        'offer.discount',

        'hotel.id',
        'hotel.name',

        'cover.id',
        'cover.pathFile',

        'level.id',
        'level.name',
      ]);

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('offer.id', 'DESC');
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
   * GET /hotel-offers/by-tourism
   */
  async getHotelOffersByTourism(tourismId: number) {
    const builder = this.hotelLevelOfferRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.hotel', 'hotel')
      .leftJoin('hotel.cover', 'cover')
      .select([
        'offer.id',
        'offer.from',
        'offer.to',
        'offer.isActive',
        'offer.levelId',
        'offer.discount',

        'hotel.id',
        'hotel.name',

        'cover.id',
        'cover.pathFile',
      ]);

    if (tourismId) {
      const { levelId } = await this.tourismService.getRecordByTourismId(
        tourismId,
      );

      builder.andWhere('(offer.levelId = :levelId OR levelId IS NULL)', {
        levelId,
      });
    }
    builder.andWhere('NOW() BETWEEN offer.from AND offer.to');
    builder.andWhere('offer.isActive = 1');
    return await builder.getMany();
  }

  /**
   * -------------------------------------------------------
   * GET /hotel-offers/1
   */
  async getHotelOfferById(hotelOfferId: number) {
    const builder = this.hotelLevelOfferRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.hotel', 'hotel')
      .leftJoin('hotel.cover', 'cover')
      .select([
        'offer.id',
        'offer.from',
        'offer.to',
        'offer.isActive',
        'offer.levelId',
        'offer.discount',

        'hotel.id',
        'hotel.name',
        'hotel.star',

        'cover.id',
        'cover.pathFile',
      ]);

    return await builder.where({ id: hotelOfferId }).getOne();
  }

  /**
   * -------------------------------------------------------
   * PUT /hotel-offers/1
   */
  async updateHotelOffer(hotelOfferId: number, dto: UpdateHotelOfferDto) {
    return await this.hotelLevelOfferRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: hotelOfferId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * DELETE /hotel-offers/1
   */
  async deleteHotelOfferById(hotelOfferId: number) {
    return await this.hotelLevelOfferRepository
      .createQueryBuilder()
      .delete()
      .where({ id: hotelOfferId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   */
  async getHotelOffersByHotelIdAndLevel(hotelId: number, levelId: number) {
    const builder = this.hotelLevelOfferRepository
      .createQueryBuilder('offer')
      .select([
        'offer.id',
        'offer.from',
        'offer.to',
        'offer.isActive',
        'offer.levelId',
        'offer.discount',
      ]);

    builder.andWhere('(offer.levelId = :levelId OR levelId IS NULL)', {
      levelId,
    });
    builder.andWhere('NOW() BETWEEN offer.from AND offer.to');
    builder.andWhere('offer.isActive = 1');
    builder.andWhere('offer.hotelId = :hotelId', { hotelId });
    return await builder.getOne();
  }
}
