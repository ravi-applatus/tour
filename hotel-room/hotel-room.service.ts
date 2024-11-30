import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'jalali-moment';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  makeRangeDateList,
  paginationResult,
} from 'src/utils';
import { IsNull, Repository } from 'typeorm';
import { HotelStatus } from '../hotel/entities/hotel.entity';
import { TourismService } from '../tourism/tourism.service';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { UpdateAvailabilityRoomDto } from './dto/update-availability-room.dto';
import { UpdateContentRoomDto } from './dto/update-content-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateRoomPriceDto } from './dto/update-room-price.dto';
import { HotelRoomPriceEntity } from './entities/hotel-room-price.entity';
import { HotelRoomEntity } from './entities/hotel-room.entity';
import { HotelRoomAvailabilityEntity } from './entities/hotel-room-availability.entity';
import { HotelRoomChildPriceEntity } from './entities/hotel-room-child-price.entity';

@Injectable()
export class HotelRoomService {
  constructor(
    @InjectRepository(HotelRoomEntity)
    private hotelRoomRepository: Repository<HotelRoomEntity>,

    @InjectRepository(HotelRoomPriceEntity)
    private hotelRoomPriceRepository: Repository<HotelRoomPriceEntity>,

    @InjectRepository(HotelRoomAvailabilityEntity)
    private hotelRoomAvailabilityRepository: Repository<HotelRoomAvailabilityEntity>,

    @InjectRepository(HotelRoomChildPriceEntity)
    private hotelRoomChildPriceRepository: Repository<HotelRoomChildPriceEntity>,

    private tourismService: TourismService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /rooms
   */
  async getHotelRooms(page = 1, limit = 20, filters = null, sorts = null) {
    let builder = await this.hotelRoomRepository.createQueryBuilder('room');

    const attributes = [
      'room.id',
      'room.hotelId',
      'room.name',
      'room.type',
      'room.maxCapacity',
      'room.maxExtraCapacity',
      'room.isActive',
    ];

    builder.select(attributes);

    builder = applyFiltersToBuilder(builder, filters);

    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('room.maxCapacity', 'ASC');
    }

    const [items, totalItems] = await builder
      .take(limit) // LIMIT
      .skip((page - 1) * limit) // OFFSET
      .getManyAndCount();

    return {
      items,
      pagination: paginationResult(page, limit, totalItems),
    };
  }

  /**
   * -------------------------------------------------------
   * GET /rooms/suggestion
   */
  async getHotelRoomsSuggestion(
    filters = null,
    tourismLevelId = null,
    tourismId = null,
    canGetFinancialInfo = false,
    checkIn = null,
    checkOut = null,
    countPassanger = null,
  ) {
    let builder = await this.hotelRoomRepository
      .createQueryBuilder('room')
      .andWhere({ isActive: true });

    const attributes = [
      'room.id',
      'room.hotelId',
      'room.name',
      'room.type',
      'room.maxCapacity',
      'room.maxExtraCapacity',
      'room.isActive',
    ];

    // For tourism manager and employee
    let levelId = tourismLevelId;
    if (tourismId) {
      ({ levelId } = await this.tourismService.getRecordByTourismId(tourismId));
    }

    if (checkIn && checkOut) {
      builder.innerJoinAndSelect(
        'room.availabilities',
        'availabilities',
        'availabilities.availabilityCount > availabilities.reservedCount AND availabilities.date >= :checkIn AND availabilities.date < :checkOut',
        { checkIn, checkOut },
      );
    } else {
      // today
      builder.innerJoin(
        'room.availabilities',
        'availabilities',
        'availabilities.availabilityCount > availabilities.reservedCount AND availabilities.date = :now',
        { now: moment().format('YYYY-MM-DD') },
      );
    }

    builder.innerJoin(
      'room.prices',
      'prices',
      'prices.levelId = :levelId AND (prices.from IS NULL OR (prices.from < :checkOut AND prices.to >= :checkIn))',
      {
        levelId,
        checkIn: moment(checkIn || new Date()).format('YYYY-MM-DD'),
        checkOut: checkOut
          ? moment(checkOut).format('YYYY-MM-DD')
          : moment().add(1, 'day').format('YYYY-MM-DD'),
      },
    );

    builder.leftJoin('prices.childPrices', 'childPrices');

    attributes.push(
      'prices.id',
      'prices.price',
      'prices.childExtraPrice',
      'prices.levelId',
      'prices.roomId',
      'prices.from',
      'prices.to',

      'childPrices.ageFrom',
      'childPrices.ageTo',
      'childPrices.price',

      'availabilities.id',
      'availabilities.date',
      'availabilities.availabilityCount',
      'availabilities.reservedCount',
    );

    if (canGetFinancialInfo) {
      attributes.push('prices.buyPrice');
      attributes.push('prices.childExtraBuyPrice');
      attributes.push('childPrices.buyPrice');
    }

    builder.innerJoin('room.hotel', 'hotel', 'hotel.status = :status', {
      status: HotelStatus.verified,
    });

    builder.select(attributes);

    builder = applyFiltersToBuilder(builder, filters);
    if (countPassanger) {
      builder.andWhere(
        'room.maxCapacity + room.maxExtraCapacity >= :countPassanger',
        { countPassanger },
      );
    }

    builder.orderBy('room.maxCapacity + room.maxExtraCapacity', 'ASC');

    let items: any = await builder.getMany();

    // find max reseve count
    items = items.map((item) => {
      item.availabilities = item.availabilities.map((avail) => ({
        ...avail,
        allowReserveCount: avail.availabilityCount - avail.reservedCount,
      }));

      return {
        ...item,
        availabilities: item.availabilities,
        maxAllowReserveCount: Math.min(
          ...item.availabilities.map((a) => a.allowReserveCount),
        ),
      };
    });

    // find best price
    items = items.map((item) => {
      const prices = item.prices
        .map((price) => ({
          ...price,
          countDays: price.from
            ? moment(price.to).diff(moment(price.from), 'days')
            : 10000,
        }))
        .sort((a, b) => a.countDays - b.countDays);

      const seperatePrices = [];
      if (checkIn && checkOut) {
        const dates = makeRangeDateList(checkIn, checkOut, false);
        const normalPrice = prices.find(
          (p) => p.from === null && p.to === null,
        );

        dates.forEach((date) => {
          const spesificPrice = prices.find((p) =>
            moment(date).isBetween(p.from, p.to, 'days', '[]'),
          );

          if (spesificPrice || normalPrice) {
            seperatePrices.push({ ...(spesificPrice || normalPrice), date });
          }
        });
      }

      return {
        ...item,
        seperatePrices,
        price: prices?.[0] || null,
      };
    });

    // check avalibalities and prices for between days
    if (checkIn && checkOut) {
      const countDays = moment(checkOut).diff(moment(checkIn), 'days');

      items = items.filter(
        (item) =>
          item.availabilities.length === countDays &&
          item.seperatePrices.length === countDays,
      );
    }

    return items;
  }

  /**
   * -------------------------------------------------------
   * GET /rooms/quick-price
   */
  async getHotelRoomsQuickPrice(
    hotelId,
    tourismLevelId,
    fromDate,
    endDate,
    canGetFinancialInfo = false,
  ) {
    const builder = await this.hotelRoomRepository
      .createQueryBuilder('room')
      .andWhere({ hotelId });

    builder.innerJoin(
      'room.prices',
      'prices',
      // 'prices.levelId = :levelId AND (prices.from IS NULL OR (prices.from < :checkOut AND prices.to >= :checkIn))',
      'prices.levelId = :levelId AND prices.from >= :fromDate AND prices.to <= :endDate',
      {
        levelId: tourismLevelId,
        fromDate,
        endDate,
      },
    );

    builder.addSelect('prices.id');
    builder.addSelect('prices.price');
    builder.addSelect('prices.childExtraPrice');
    builder.addSelect('prices.levelId');
    builder.addSelect('prices.roomId');
    builder.addSelect('prices.from');
    builder.addSelect('prices.to');

    if (canGetFinancialInfo) {
      builder.addSelect('prices.buyPrice');
      builder.addSelect('prices.childExtraBuyPrice');
    }

    builder.leftJoinAndSelect('prices.childPrices', 'childPrices');

    return await builder.getMany();
  }

  /**
   * -------------------------------------------------------
   * GET /rooms/1
   */

  async getHotelRoomById(
    roomId,
    tourismLevelId = null,
    tourismId = null,
    canGetFinancialInfo = false,
  ) {
    const builder = this.hotelRoomRepository.createQueryBuilder('room');

    builder.andWhere({ id: roomId });
    builder.leftJoin('room.prices', 'prices');

    const attributes = [
      'room.id',
      'room.name',
      'room.type',
      'room.maxCapacity',
      'room.maxExtraCapacity',
      // TODO:
      // 'room.availabilityCount',
      // 'room.reservedCount',
      'room.isActive',

      'prices.id',
      'prices.price',
      'prices.childExtraPrice',
      'prices.levelId',
      'prices.roomId',
      'prices.from',
      'prices.to',
    ];

    if (canGetFinancialInfo) {
      attributes.push('prices.buyPrice');
      attributes.push('prices.childExtraBuyPrice');
    }

    builder.select(attributes);

    // For tourism manager and employee
    if (tourismId || tourismLevelId) {
      let levelId = tourismLevelId;
      if (tourismId) {
        ({ levelId } = await this.tourismService.getRecordByTourismId(
          tourismId,
        ));
      }

      // TODO:
      // builder.andWhere('room.availabilityCount > room.reservedCount');

      builder.andWhere(
        'prices.levelId = :levelId  AND (prices.from IS NULL OR NOW() BETWEEN prices.from AND prices.to)',
        {
          levelId,
        },
      );

      builder.innerJoin('room.hotel', 'hotel', 'hotel.status = :status', {
        status: HotelStatus.verified,
      });
    }
    return await builder.getOne();
  }

  /**
   * -------------------------------------------------------
   * POST /rooms
   * add new room for hotel
   */

  async addHotelRoom(dto: CreateHotelRoomDto) {
    const { identifiers } = await this.hotelRoomRepository
      .createQueryBuilder()
      .insert()
      .values({ ...dto, isActive: true })
      .execute();

    const newRoomId = identifiers[0].id;
    return await this.hotelRoomRepository.findOne(newRoomId);
  }

  /**
   * -------------------------------------------------------
   * PUT /rooms/content/1
   */
  async updateContentRoom(roomId: number, dto: UpdateContentRoomDto) {
    return await this.hotelRoomRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: roomId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * PUT /rooms/availability/1
   */
  async updateAvailabilityRoom(dto: UpdateAvailabilityRoomDto) {
    const ranges = makeRangeDateList(dto.from, dto.to);

    for (let i = 0; i < ranges.length; i++) {
      const date = ranges[i];

      const found = await this.hotelRoomAvailabilityRepository.findOne({
        roomId: dto.roomId,
        date,
      });

      // Updating
      if (found) {
        found.availabilityCount = dto.availabilityCount;
        await found.save();
      }
      // Inserting
      else {
        await this.hotelRoomAvailabilityRepository
          .createQueryBuilder()
          .insert()
          .values({
            ...dto,
            date,
            reservedCount: 0,
          })
          .execute();
      }
    }
  }

  /**
   * -------------------------------------------------------
   * GET /rooms/availability/1
   */
  async getAvailabilitiesRoom(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
  ) {
    let builder =
      this.hotelRoomAvailabilityRepository.createQueryBuilder('availability');

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('availability.date', 'DESC');
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
   * PUT /rooms/1
   */
  async updateRoom(roomId: number, dto: UpdateRoomDto) {
    return await this.hotelRoomRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: roomId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * PUT /rooms/price/1
   * update price for room of hotel
   */
  async addUpdateRoomPrice(dto: UpdateRoomPriceDto) {
    let foundPrice = null;
    if (!dto.from) {
      foundPrice = await this.hotelRoomPriceRepository.findOne({
        levelId: dto.levelId,
        roomId: dto.roomId,
        from: IsNull(),
      });
    }
    if (dto.priceId) {
      foundPrice = await this.hotelRoomPriceRepository.findOne(dto.priceId);
    }

    // edit the price
    if (foundPrice) {
      foundPrice.price = dto.price;
      foundPrice.buyPrice = dto.buyPrice;
      foundPrice.childExtraPrice = dto.childExtraPrice;
      foundPrice.childExtraBuyPrice = dto.childExtraBuyPrice;
      foundPrice.from = dto.from || null;
      foundPrice.to = dto.to || null;
      if (dto.priceId) foundPrice.levelId = dto.levelId;
      await foundPrice.save();
    }
    // add new price
    else {
      const { identifiers } = await this.hotelRoomPriceRepository
        .createQueryBuilder()
        .insert()
        .values(dto)
        .execute();

      const roomPriceId = identifiers[0].id;
      foundPrice = await this.hotelRoomPriceRepository.findOne(roomPriceId);
    }

    // remove olds child prices
    await this.hotelRoomChildPriceRepository.delete({
      roomPriceId: foundPrice.id,
    });

    // add child prices
    if (dto.childPrices?.length > 0) {
      // add news
      await this.hotelRoomChildPriceRepository
        .createQueryBuilder()
        .insert()
        .values(
          dto.childPrices.map((p) => ({ ...p, roomPriceId: foundPrice.id })),
        )
        .execute();
    }

    return foundPrice;
  }

  /**
   * -------------------------------------------------------
   * DELETE /rooms/price/1
   */
  async deleteRoomPrice(id) {
    // remove child prices
    await this.hotelRoomChildPriceRepository.delete({
      roomPriceId: id,
    });

    // remove main price
    return await this.hotelRoomPriceRepository
      .createQueryBuilder()
      .delete()
      .where({ id })
      .execute();
  }

  /**
   * -------------------------------------------------------
   */
  async getRoomAndPriceById(roomId, tourismLevelId) {
    return await this.hotelRoomRepository
      .createQueryBuilder('room')
      .innerJoinAndSelect(
        'room.prices',
        'prices',
        'prices.levelId = :tourismLevelId',
        { tourismLevelId },
      )
      .innerJoinAndSelect('room.hotel', 'hotel')
      .andWhere({ id: roomId })
      .getOne();
  }

  /**
   * -------------------------------------------------------
   */
  async updateReservedCount(roomId: number, checkIn, checkOut, quantity) {
    await this.hotelRoomAvailabilityRepository
      .createQueryBuilder()
      .update()
      .set({ reservedCount: () => 'reservedCount + :quantity' })
      .setParameter('quantity', quantity)
      .where({ roomId })
      .andWhere('date >= :checkIn AND date < :checkOut', { checkIn, checkOut })
      .execute();
  }

  /**
   * -------------------------------------------------------
   */
  async getSumRoom() {
    const { sumReservedCount, sumAvailabilityCount } =
      await this.hotelRoomAvailabilityRepository
        .createQueryBuilder('availability')
        .select([
          'SUM(availability.reservedCount) AS sumReservedCount',
          'SUM(availability.availabilityCount) AS sumAvailabilityCount',
        ])
        .getRawOne();

    return {
      sumReservedCount: +sumReservedCount,
      sumAvailabilityCount: +sumAvailabilityCount,
    };
  }

  /**
   * -------------------------------------------------------
   */
  async getHotelRoomSuggestionById(id, hotelId, levelId, checkIn, checkOut) {
    const filters = [
      {
        logicalOperator: 'AND',
        data: [
          {
            field: 'id',
            comparisonOperator: '=',
            value: id,
            dbFunction: undefined,
          },
          {
            field: 'hotelId',
            comparisonOperator: '=',
            value: hotelId,
            dbFunction: undefined,
          },
        ],
      },
    ];

    const list = await this.getHotelRoomsSuggestion(
      filters,
      levelId,
      null,
      true,
      checkIn,
      checkOut,
    );

    const item = list?.[0] || null;
    if (!item) return null;

    return item;
  }

  // /**
  //  * -------------------------------------------------------
  //  * using in hotelService
  //  */
  // async priceRangeByLevel(
  //   hotelIds: number[],
  //   levelId: number,
  //   countPassanger = null,
  //   checkIn = null,
  //   checkOut = null,
  // ) {
  //   const builder = this.hotelRoomRepository
  //     .createQueryBuilder('room')
  //     .select([
  //       'room.hotelId AS hotelId',
  //       'MIN(prices.price) AS minPrice',
  //       'MAX(prices.price) AS maxPrice',
  //     ])
  //     .groupBy('room.hotelId')
  //     .innerJoin(
  //       'room.prices',
  //       'prices',
  //       'prices.levelId = :levelId AND (prices.from IS NULL OR prices.from <= :date AND prices.to > :date)',
  //       {
  //         levelId,
  //         date: moment(checkIn || new Date()).format('YYYY-MM-DD'),
  //       },
  //     )
  //     .andWhere('room.hotelId IN (:...hotelIds)', { hotelIds });

  //   if (checkIn && checkOut) {
  //     builder.innerJoinAndSelect(
  //       'room.availabilities',
  //       'availabilities',
  //       'availabilities.availabilityCount > availabilities.reservedCount AND availabilities.date >= :checkIn AND availabilities.date < :checkOut',
  //       { checkIn, checkOut },
  //     );
  //   } else {
  //     // today
  //     builder.innerJoin(
  //       'room.availabilities',
  //       'availabilities',
  //       'availabilities.availabilityCount > availabilities.reservedCount AND availabilities.date = :now',
  //       { now: moment().format('YYYY-MM-DD') },
  //     );
  //   }

  //   if (countPassanger) {
  //     builder.andWhere('room.maxCapacity + room.maxExtraCapacity >= :cp', {
  //       cp: countPassanger,
  //     });
  //   }

  //   return await builder.getRawMany();
  // }
}
