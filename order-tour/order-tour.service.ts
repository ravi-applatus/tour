import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
  seperateChildAndAdultList,
} from 'src/utils';
import * as moment from 'jalali-moment';
import { Repository } from 'typeorm';
import { InvoiceStatus } from '../invoice/entities/invoice.entity';
import { InvoiceService } from '../invoice/invoice.service';
import { TourMapFeatureEntity } from '../tour/entities/tour-map-feature.entity';
import { TourService } from '../tour/tour.service';
import { TourismService } from '../tourism/tourism.service';
import { CreateOrderTourDto } from './dto/create-order-tour.dto';
import { OrderTourMapFeatureEntity } from './entities/order-tour-map-feature.entity';
import { OrderTourEntity } from './entities/order-tour.entity';
import { CustomerService } from '../customer/customer.service';

@Injectable()
export class OrderTourService {
  constructor(
    @InjectRepository(OrderTourEntity)
    private orderTourRepository: Repository<OrderTourEntity>,

    @InjectRepository(OrderTourMapFeatureEntity)
    private orderTourMapFeatureRepository: Repository<OrderTourMapFeatureEntity>,

    private error: ErrorService,
    private tourismService: TourismService,
    private tourService: TourService,
    private customerService: CustomerService,

    @Inject(forwardRef(() => InvoiceService))
    private invoiceService: InvoiceService,
  ) {}

  /**
   * --------------------------------------------------------
   * Post /order-tours
   * add new order tour
   */
  async createOrderTour(
    userId: number,
    dto: CreateOrderTourDto,
    tourismId = null,
    tourismLevelId = null,
  ) {
    const invoice = await this.invoiceService.findRecordById(dto.invoiceId);
    if (!invoice) {
      this.error.unprocessableEntity(['اطلاعات ورودی نامعتبر است']);
    }
    if (tourismId && invoice.tourismId !== tourismId) {
      this.error.unprocessableEntity(['اطلاعات ورودی نامعتبر است']);
    }
    if (
      invoice.status === InvoiceStatus.accepted ||
      invoice.status === InvoiceStatus.done
    ) {
      this.error.unprocessableEntity([
        'امکان تغییر در فاکتور تایید شده وجود ندارد',
      ]);
    }

    let levelId = tourismLevelId;
    if (tourismId) {
      ({ levelId } = await this.tourismService.getRecordByTourismId(tourismId));
    }
    const tour = await this.tourService.getTourRecordById(dto.tourId);

    // const fromMoment = moment(tour.from, 'YYYY-MM-DD');
    // const toMoment = moment(tour.to, 'YYYY-MM-DD');
    // const nights = toMoment.diff(fromMoment, 'days');

    const price = await this.tourService.getPriceById(dto.tourId, levelId);

    // Fetching customers record by customer Ids
    const customers = await this.customerService.getCustomersRecordByIds(
      dto.customerIds,
    );

    const { childs, infants, adults } = seperateChildAndAdultList(customers);
    const countChildAdult = childs.length + adults.length;

    // // Checking tour availability
    // if (
    //   tour.reservedCount >= tour.availabilityCount &&
    //   tour.availabilityCount - tour.reservedCount < countChildAdult
    // ) {
    //   this.error.unprocessableEntity([`${tour.name}، موجودی ندارد`]);
    // }

    // Fetching tour map features
    // const mapFeatures = await this.tourService.getTourMapFeaturesByFeaturesId(
    //   dto.featureIds.map((f) => +f),
    //   dto.tourId,
    // );

    // Calculating sum amount
    let amount = 0;
    let buyAmount = 0;

    if (price) {
      amount += adults.length * price.price;
      buyAmount += adults.length * price.buyPrice;

      if (price.childPrices.length > 0) {
        amount += [...childs, ...infants].reduce((sum, chc) => {
          const found = price.childPrices.find(
            (chp) => chp.ageFrom < chc.age && chp.ageTo >= chc.age,
          );
          return sum + found?.price || 0;
        }, 0);

        buyAmount += [...childs, ...infants].reduce((sum, chc) => {
          const found = price.childPrices.find(
            (chp) => chp.ageFrom < chc.age && chp.ageTo >= chc.age,
          );
          return sum + found?.buyPrice || 0;
        }, 0);
      }
    }

    if (amount === 0) {
      this.error.unprocessableEntity(['اطلاعات ورودی نامعتبر می‌باشد']);
    }

    // Calculating the commission
    let commission = 0;
    if (tour.commissionPerPerson) {
      commission = tour.commissionPerPerson * countChildAdult;
    } else if (tour.percentageCommission) {
      commission = (tour.percentageCommission * amount) / 100;
    }

    // Inserting into order
    const { identifiers } = await this.orderTourRepository
      .createQueryBuilder()
      .insert()
      .values({
        ...dto,
        userId,
        tourismId,
        price: price?.price || 0,
        buyPrice: price?.buyPrice || 0,
        amount,
        buyAmount,
        countCustomer: dto.customerIds.length,
        commission,
        createdAt: new Date(),
      })
      .execute();
    const newOrderId = identifiers[0].id;

    // Updating tour with new reservedCount value
    await this.tourService.updateReservedCount(
      tour.id,
      tour.reservedCount + countChildAdult,
    );

    // // Inserting into feature mapping
    // await this.orderTourMapFeatureRepository
    //   .createQueryBuilder()
    //   .insert()
    //   .values(
    //     mapFeatures.map((mf) => ({
    //       tourFeatureId: mf.tourFeatureId,
    //       orderTourId: newOrderId,
    //       price: mf.isOptional ? +mf.price : 0,
    //     })),
    //   )
    //   .execute();

    // update invoice customers
    await this.invoiceService.updateCustomerByInvoiceIdAndCustomerIds(
      dto.invoiceId,
      dto.customerIds,
      { orderTourId: newOrderId },
    );

    // Updating the invoice amounts
    invoice.amount += amount - commission;
    invoice.buyAmount += buyAmount;
    invoice.totalAmount += amount - commission;
    await invoice.save();

    // Fetching the order by the new order ID
    return await this.orderTourRepository.findOne(newOrderId);
  }

  /**
   * -------------------------------------------------------
   * GET /order-tours
   */
  async getOrders(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    tourismId = null,
    canGetFinancialInfo = false,
  ) {
    let builder = this.orderTourRepository
      .createQueryBuilder('order')
      .leftJoin('order.tourism', 'tourism')
      .leftJoin('order.user', 'user')
      .leftJoin('order.tour', 'tour');
    // .leftJoin('tour.prices', 'prices');

    const attributes = [
      'order.id',
      'order.invoiceId',
      'order.tourId',
      'order.price',
      'order.countCustomer',
      'order.amount',
      'order.createdAt',

      'tour.id',
      'tour.name',

      'tourism.id',
      'tourism.name',

      'user.id',
      'user.firstName',
      'user.lastName',
    ];

    builder = applyFiltersToBuilder(builder, filters);

    // For tourism manager
    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    if (canGetFinancialInfo) {
      attributes.push('order.buyPrice');
      attributes.push('order.buyAmount');
    }

    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('order.createdAt', 'DESC');
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
   * GET /order-tours/1
   */
  async getOrderTourById(
    orderTourId: number,
    tourismId: number = null,
    canGetFinancialInfo = false,
  ) {
    const builder = this.orderTourRepository
      .createQueryBuilder('order')
      .leftJoin('order.tourism', 'tourism')
      .leftJoin('order.invoice', 'invoice')
      .leftJoin('order.user', 'user')
      .leftJoin('order.tour', 'tour')
      .leftJoin('order.orderTourMapFeatures', 'orderMapFeatures')
      .leftJoin('orderMapFeatures.tourFeature', 'tourFeature');

    const attributes = [
      'order.id',
      'order.price',
      'order.countCustomer',
      'order.amount',
      'order.description',
      'order.createdAt',

      'tourism.id',
      'tourism.name',

      'user.id',
      'user.firstName',
      'user.lastName',

      'invoice.id',
      'invoice.amount',
      'invoice.passengersInfoStatus',
      'invoice.passengersInfoReasonRejected',
      'invoice.status',
      'invoice.reasonRejected',

      'tour.id',
      'tour.name',
      'tour.managerName',
      'tour.phone',
      // 'tour.originCity',
      // 'tour.originCountry',
      'tour.destinationCity',
      'tour.destinationCountry',
      // 'tour.from',
      // 'tour.to',
      'tour.transportType',

      'orderMapFeatures.id',
      'orderMapFeatures.price',

      'tourFeature.id',
      'tourFeature.title',
      'tourFeature.icon',
    ];

    // For tourism manager
    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    if (canGetFinancialInfo) {
      attributes.push('order.buyPrice');
      attributes.push('order.buyAmount');
    }

    return await builder.where({ id: orderTourId }).getOne();
  }

  /**
   * -------------------------------------------------------
   * DELETE /order-tours/1
   */
  async deleteOrder(orderTourId: number, tourismId: number = null) {
    const orderTour = await this.orderTourRepository.findOne({
      where: { id: orderTourId },
      relations: ['invoice', 'tour', 'orderTourMapFeatures'],
    });

    if (tourismId && orderTour.invoice.tourismId !== tourismId) {
      this.error.unprocessableEntity(['اطلاعات ورودی نامعتبر است']);
    }
    if (
      orderTour.invoice.status === InvoiceStatus.accepted ||
      orderTour.invoice.status === InvoiceStatus.done
    ) {
      this.error.unprocessableEntity(['امکان حذف فاکتور تایید شده وجود ندارد']);
    }

    orderTour.tour.reservedCount -= orderTour.countCustomer;
    await orderTour.tour.save();

    orderTour.invoice.amount -= orderTour.amount;
    await orderTour.invoice.save();

    for (let i = 0; i < orderTour.orderTourMapFeatures.length; i++) {
      await orderTour.orderTourMapFeatures[i].remove();
    }
    await orderTour.remove();
  }

  /**
   * -------------------------------------------------------
   *
   */
  async getOrderTourRecordById(orderTourId: number) {
    return await this.orderTourRepository.findOne(orderTourId);
  }

  // /**
  //  * -------------------------------------------------------
  //  */
  // private _calculateAmountOnePassenger(
  //   price: number,
  //   buyPrice: number,
  //   mapFeatures: TourMapFeatureEntity[],
  //   countAdult: number,
  //   countChild: number,
  // ) {
  //   const sumFeatures = mapFeatures.reduce(
  //     (acc, mapFeature) =>
  //       acc + (mapFeature.isOptional ? +mapFeature.price : 0),
  //     0,
  //   );

  //   const countAll = countAdult + countChild;

  //   const amount =
  //     price * countAdult + price * countChild + sumFeatures * countAll;

  //   const buyAmount =
  //     buyPrice * countAdult + buyPrice * countChild + sumFeatures * countAll;

  //   return { amount, buyAmount };
  // }

  /**
   * -------------------------------------------------------
   */
  async updateById(orderTourId: number, values: any) {
    await this.orderTourRepository
      .createQueryBuilder()
      .update()
      .set(values)
      .where({ id: orderTourId })
      .execute();
  }
}
