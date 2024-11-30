import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'jalali-moment';
import { ErrorService } from 'src/error/error.service';
import * as path from 'path';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
  seperateChildAndAdultList,
} from 'src/utils';
import { Repository } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { CustomerService } from '../customer/customer.service';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { HotelOfferService } from '../hotel-offer/hotel-offer.service';
import { HotelRoomService } from '../hotel-room/hotel-room.service';
import { HotelService } from '../hotel/hotel.service';
import {
  InvoiceStatus,
  InvoiceStatusTranslate,
} from '../invoice/entities/invoice.entity';
import { InvoiceService } from '../invoice/invoice.service';
import { SettingService } from '../setting/setting.service';
import { TourismService } from '../tourism/tourism.service';
import { CreateOrderHotelDto } from './dto/create-order-hotel.dto';
import { CreateRoomOrderHotelDto } from './dto/create-room-order-hotel.dto';
import { UpdateAvailabilityStatusRoomDto } from './dto/update-availability-status-room.dto';
import { OrderHotelMapFeatureEntity } from './entities/order-hotel-map-feature.entity';
import {
  AvailabilityStatus,
  OrderHotelMapRoomEntity,
} from './entities/order-hotel-map-room.entity';
import { OrderHotelEntity } from './entities/order-hotel.entity';

import { Workbook } from 'exceljs';
import * as tmp from 'tmp';
import { CustomerGendersTranslate } from '../invoice/entities/invoice-customer.entity';
import { CreateTransferInfoDto } from './dto/update-transfer-info.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypes } from '../notification/entities/notification.entity';

@Injectable()
export class OrderHotelService {
  constructor(
    @InjectRepository(OrderHotelEntity)
    private orderHotelRepository: Repository<OrderHotelEntity>,

    @InjectRepository(OrderHotelMapRoomEntity)
    private orderHotelMapRoomRepository: Repository<OrderHotelMapRoomEntity>,

    @InjectRepository(OrderHotelMapFeatureEntity)
    private orderHotelMapFeatureRepository: Repository<OrderHotelMapFeatureEntity>,

    private hotelRoomService: HotelRoomService,
    private tourismService: TourismService,
    private hotelService: HotelService,
    private hotelOfferService: HotelOfferService,
    private customerService: CustomerService,
    private settingService: SettingService,
    private notificationService: NotificationService,
    private error: ErrorService,
    private mail: MailService,

    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
  ) {}

  /**
   * -------------------------------------------------------
   * POST /order-hotels
   * add new order hotel
   */
  async createOrderHotel(
    userId: number,
    dto: CreateOrderHotelDto,
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

    const hotel = await this.hotelService.getHotelRecordById(dto.hotelId);

    const {
      rooms,
      mapFeatures,
      amount,
      buyAmount,
      discountAmount,
      totalAmount,
    } = await this.initializeDataForCreatingOrderHotel(
      dto,
      tourismId,
      tourismLevelId,
    );

    // Inserting into order hotel
    const { identifiers } = await this.orderHotelRepository
      .createQueryBuilder()
      .insert()
      .values({
        ...dto,
        number: await this._generateNumber(hotel.code),
        invoiceId: dto.invoiceId,
        userId,
        tourismId,
        amount,
        buyAmount,
        discountAmount,
        totalAmount,
        createdAt: new Date(),
      })
      .execute();
    const newOrderId = identifiers[0].id;

    // Updating the invoice amounts
    invoice.amount += amount;
    invoice.buyAmount += buyAmount;
    invoice.discountAmount += discountAmount;
    invoice.totalAmount += amount;
    await invoice.save();

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];

      // Inserting into room mapping
      const newMapRecord = await this.orderHotelMapRoomRepository
        .createQueryBuilder()
        .insert()
        .values({
          orderHotelId: newOrderId,
          hotelRoomId: room.id,
          amount: room.amount,
          buyAmount: room.buyAmount,
          quantity: room.quantity,
          availabilityStatus: hotel.needOrderConfirmAvailability
            ? AvailabilityStatus.waiting
            : AvailabilityStatus.systemVerified,
        })
        .execute();

      const newMapId = newMapRecord.identifiers[0].id;

      // update invoice customers
      await this.invoiceService.updateCustomerByInvoiceIdAndCustomerIds(
        dto.invoiceId,
        room.customers.map((c) => c.id),
        { orderRoomId: newMapId },
      );

      // Updating hotel room with new reservedCount value
      await this.hotelRoomService.updateReservedCount(
        room.id,
        dto.checkIn,
        dto.checkOut,
        room.quantity,
      );
    }

    // Inserting into feature mapping
    await this.orderHotelMapFeatureRepository
      .createQueryBuilder()
      .insert()
      .values(
        mapFeatures.map((mf) => ({
          hotelFetureId: mf.hotelFeatureId,
          orderHotelId: newOrderId,
          price: mf.isOptional ? +mf.price : 0,
        })),
      )
      .execute();

    // Handling to needs to check room availability and working time
    let messages = ['رزرو هتل مشتری مورد نظر شما با موفقیت ثبت شد'];
    if (hotel.needOrderConfirmAvailability) {
      if (await this.settingService.isInTimeWork()) {
        messages = [
          'رزرو هتل مشتری مورد نظر شما در سیستم ثبت شد، لطفا منتظر تایید موجودی اتاق توسط کارشناس مربوطه باشید',
        ];
      } else {
        messages = [
          'رزرو هتل مشتری مورد نظر شما در سیستم ثبت شد، تایم کاری امروز به پایان رسیده است، لطفا منتظر تایید موجودی اتاق توسط کارشناس مربوطه باشید',
        ];
      }
    }

    // Fetching the order by the new order ID
    // const newOrder = await this.orderHotelRepository.findOne(newOrderId);
    return {
      messages,
      newOrder: newOrderId,
    };
  }

  /**
   * -------------------------------------------------------
   */
  async exportExcel(filters = null, tourismId = null, hasTransfer = false) {
    const builder = this._getAllBuilder(tourismId, filters, hasTransfer);

    builder.orderBy('order.checkIn', 'ASC');
    const items = await builder.getMany();

    // Create excel file
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(`sheet1`);
    // worksheet.views = [{ rightToLeft: true }];

    worksheet.addRow([
      ...(!tourismId ? ['نام آژانس'] : []),
      'نام هتل',
      ...(!tourismId ? ['شماره فاکتور سیستمی'] : []),
      'شماره فاکتور آژانس',
      'تاریخ ورود',
      'تاریخ خروج',
      'ترانسفر',
      'وضعیت فاکتور',
      'هزینه رزرو هتل ($)',
    ]);

    items.forEach((item) => {
      worksheet.addRow([
        ...(!tourismId ? [item.tourism?.name || '-'] : []),
        item.orderHotelMapRooms?.[0]?.hotelRoom?.hotel?.name || '',
        ...(!tourismId ? [item.invoice?.systemNumber || '-'] : []),
        item.invoice?.tourismNumber || '-',
        moment(item.checkIn).format('YYYY/MM/DD'),
        moment(item.checkOut).format('YYYY/MM/DD'),
        item.arrivalDate ? 'دارد' : 'ندارد',
        InvoiceStatusTranslate[item.invoice?.status] || '-',
        item.totalAmount,
      ]);
    });

    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBFBFBF' },
    };

    for (let i = 1; i <= 9; i++) {
      worksheet.getColumn(i).width = 15;
    }

    // Save on tmp and export excel file
    try {
      const tmpobj = tmp.fileSync({
        mode: 0o644,
        prefix: `order_hotels_${moment().format('YYYY-MM-DD')}`,
        postfix: '.xlsx',
        discardDescriptor: true,
      });
      await workbook.xlsx.writeFile(tmpobj.name);
      return tmpobj.name;
    } catch (err) {
      console.log(err);
      this.error.internalServerError(['در تولید فایل اکسل خطایی رخ داده است']);
    }
  }

  /**
   * -------------------------------------------------------
   */
  async exportExcelBasedOnPassenger(
    filters = null,
    tourismId = null,
    hasTransfer = false,
  ) {
    const builder = this._getAllBuilder(tourismId, filters, hasTransfer);

    builder.leftJoin('orderMapRooms.invoiceCustomers', 'invoiceCustomers');
    builder.addSelect('order.arrivalAirline');
    builder.addSelect('order.departureAirline');
    builder.addSelect('order.arrivalDate');
    builder.addSelect('order.arrivalNumber');
    builder.addSelect('order.departureDate');
    builder.addSelect('order.departureNumber');
    builder.addSelect('invoiceCustomers.id');
    builder.addSelect('invoiceCustomers.firstName');
    builder.addSelect('invoiceCustomers.lastName');
    builder.addSelect('invoiceCustomers.gender');
    builder.addSelect('invoiceCustomers.age');

    builder.orderBy('order.checkIn', 'ASC');
    const orders = await builder.getMany();

    // Create excel file
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(`sheet1`);
    // worksheet.views = [{ rightToLeft: true }];

    worksheet.addRow([
      'Area',
      'Hotel',
      'Voucher',
      'Passenger 1',
      'Passenger 2',
      'C/INN',
      'C/OUT',
      'Adult',
      'Child',
      'Infant',
      'Note',
      'Arr No',
      'Dep No',
      'Arr Date',
      'Dep Date',
      ...(!tourismId ? ['Agency'] : []),
    ]);
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBFBFBF' },
    };

    orders.forEach((order) => {
      const hotel = order.orderHotelMapRooms?.[0]?.hotelRoom?.hotel;
      const invoice = order.invoice;

      const customers = [];
      order.orderHotelMapRooms.forEach((map) => {
        map.invoiceCustomers.forEach((customer) => {
          customers.push(customer);
        });
      });

      const { childs, adults, infants } = seperateChildAndAdultList(customers);

      worksheet.addRow([
        // Area
        `${hotel?.city || ''} / ${hotel?.state || ''}`,
        // Hotel
        hotel?.name || '',
        // Voucher
        invoice?.tourismNumber || '-',
        // Passenger 1
        customers?.[0]
          ? `${CustomerGendersTranslate[customers[0].gender]} ${
              customers[0].firstName
            } ${customers[0].lastName}`
          : '',
        // Passenger 2
        customers?.[1]
          ? `${CustomerGendersTranslate[customers[1].gender]} ${
              customers[1].firstName
            } ${customers[1].lastName}`
          : '',
        // C/INN
        moment(order.checkIn).format('DD/MM/YYYY'),
        // C/OUT
        moment(order.checkOut).format('DD/MM/YYYY'),
        // Adult
        adults?.length || '',
        // Child
        childs?.length || '',
        // Infant
        infants?.length || '',
        // Note
        order.description,
        // Arr No
        `${order.arrivalAirline || ''} ${order.arrivalNumber || ''}`,
        // Dep No
        `${order.departureAirline || ''} ${order.departureNumber || ''}`,
        // Arr Date
        order.arrivalDate
          ? moment(order.arrivalDate).format('DD/MM/YYYY HH:mm')
          : '',
        // Dep Date
        order.departureDate
          ? moment(order.departureDate).format('DD/MM/YYYY HH:mm')
          : '',
        // Agency
        ...(!tourismId ? [order.tourism?.name || '-'] : []),
      ]);
    });

    worksheet.getColumn(1).width = 16;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 10;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 12;
    worksheet.getColumn(7).width = 12;
    worksheet.getColumn(8).width = 6;
    worksheet.getColumn(9).width = 6;
    worksheet.getColumn(10).width = 6;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 13;
    worksheet.getColumn(13).width = 13;
    worksheet.getColumn(14).width = 16;
    worksheet.getColumn(15).width = 16;
    worksheet.getColumn(16).width = 16;

    // Save on tmp and export excel file
    try {
      const tmpobj = tmp.fileSync({
        mode: 0o644,
        prefix: `order_hotels_passengers_${moment().format('YYYY-MM-DD')}`,
        postfix: '.xlsx',
        discardDescriptor: true,
      });
      await workbook.xlsx.writeFile(tmpobj.name);
      return tmpobj.name;
    } catch (err) {
      console.log(err);
      this.error.internalServerError(['در تولید فایل اکسل خطایی رخ داده است']);
    }
  }

  /**
   * -------------------------------------------------------
   * GET /order-hotels
   */
  async getOrders(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    tourismId = null,
    hasTransfer = false,
    canGetFinancialInfo = false,
  ) {
    let builder = this._getAllBuilder(
      tourismId,
      filters,
      hasTransfer,
      canGetFinancialInfo,
    );

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
      sumTotalAmount: await this._getSum(tourismId, filters, hasTransfer),
      pagination: paginationResult(page, limit, totalItems),
    };
  }

  /**
   * -------------------------------------------------------
   * GET /order-hotels/1
   */
  async getOrderHotelById(
    orderHotelId: number,
    tourismId: number = null,
    canGetFinancialInfo = false,
  ) {
    const builder = this.orderHotelRepository
      .createQueryBuilder('order')
      .leftJoin('order.tourism', 'tourism')
      .leftJoin('order.invoice', 'invoice')
      .leftJoin('order.user', 'user')
      .leftJoin('order.orderHotelMapRooms', 'orderMapRooms')
      .leftJoin('orderMapRooms.hotelRoom', 'hotelRoom')
      .leftJoin('hotelRoom.hotel', 'hotel')
      .leftJoin('order.orderHotelMapFeatures', 'orderMapFeatures')
      .leftJoin('orderMapFeatures.hotelFeature', 'hotelFeature');

    const attributes = [
      'order.id',
      'order.number',
      'order.amount',
      'order.discountAmount',
      'order.totalAmount',
      'order.checkIn',
      'order.checkOut',
      'order.description',
      'order.createdAt',
      'order.voucherReserveFile',
      'order.voucherPassengerFile',

      'order.arrivalAirline',
      'order.arrivalDate',
      'order.arrivalNumber',
      'order.departureAirline',
      'order.departureDate',
      'order.departureNumber',

      'tourism.id',
      'tourism.name',
      'tourism.levelId',

      'user.id',
      'user.firstName',
      'user.lastName',

      'invoice.id',
      'invoice.amount',
      'invoice.passengersInfoStatus',
      'invoice.passengersInfoReasonRejected',
      'invoice.status',
      'invoice.reasonRejected',

      'orderMapRooms.id',
      'orderMapRooms.amount',
      'orderMapRooms.availabilityStatus',
      'orderMapRooms.availabilityReasonRejected',

      'hotelRoom.id',
      'hotelRoom.hotelId',
      'hotelRoom.name',
      'hotelRoom.type',
      'hotelRoom.maxCapacity',
      'hotelRoom.maxExtraCapacity',

      'hotel.id',
      'hotel.name',
      'hotel.star',
      'hotel.country',
      'hotel.state',
      'hotel.city',

      'orderMapFeatures.id',
      'orderMapFeatures.price',

      'hotelFeature.id',
      'hotelFeature.title',
      'hotelFeature.icon',
    ];

    // For tourism manager
    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    if (canGetFinancialInfo) {
      attributes.push('order.buyAmount');
      attributes.push('invoice.buyAmount');
      attributes.push('orderMapRooms.buyAmount');
    }

    builder.select(attributes);

    return await builder.where({ id: orderHotelId }).getOne();
  }

  /**
   * -------------------------------------------------------
   * PUT /order-hotels/1/availability-status-room
   */
  async updateAvailabilityStatusRoom(
    orderHotelMapRoomId: number,
    dto: UpdateAvailabilityStatusRoomDto,
  ) {
    return await this.orderHotelMapRoomRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: orderHotelMapRoomId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * PUT /order-hotels/1/transfer-info
   */
  async updateTransferInfo(orderHotelId: number, dto: CreateTransferInfoDto) {
    await this.orderHotelRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: orderHotelId })
      .execute();

    const orderHotel = await this.orderHotelRepository.findOne({
      where: { id: orderHotelId },
      relations: ['invoice'],
    });

    // Sending a notif to tourism
    await this.notificationService.add({
      tourismId: orderHotel.invoice.tourismId,
      type: NotificationTypes.invoice,
      sourceId: orderHotel.invoiceId,
      message: `اطلاعات پرواز فاکتور ${orderHotel.invoice.tourismNumber} توسط مدیر سیستم ویرایش شد`,
    });

    // re-generating the PDFs
    await this.invoiceService.updateInvoice(orderHotel.invoiceId, {
      status: orderHotel.invoice.status,
    } as any);

    return orderHotel;
  }

  /**
   * --------------------------------------------------------
   * Post /order-hotels/room
   * add room to current order
   */
  async addRoom(
    dto: CreateRoomOrderHotelDto,
    tourismId: number = null,
    tourismLevelId = null,
  ) {
    const orderHotel = await this.orderHotelRepository.findOne({
      where: { id: dto.orderHotelId },
      relations: ['invoice'],
    });

    if (tourismId && tourismId !== orderHotel.tourismId) {
      this.error.methodNotAllowed([
        'امکان ویرایش این سفارش برای شما، وجود ندارد.',
      ]);
    }

    if (orderHotel.invoice.status !== InvoiceStatus.pending) {
      this.error.methodNotAllowed([
        'این پیش فاکتور تأیید شده است، امکان ویرایش در این وضعیت، وجود ندارد.',
      ]);
    }

    let levelId = tourismLevelId;
    if (tourismId) {
      ({ levelId } = await this.tourismService.getRecordByTourismId(tourismId));
    }

    // Fetching room record by the room ID
    const room = await this.hotelRoomService.getRoomAndPriceById(
      dto.roomId,
      levelId,
    );

    // Checking room availability
    // TODO:
    // if (room.reservedCount >= room.availabilityCount) {
    //   this.error.unprocessableEntity([`${room.name}، موجودی ندارد`]);
    // }

    // Inserting into room mapping
    let availabilityStatus = AvailabilityStatus.systemVerified;

    // Handling to needs to check room availability
    if (tourismId) {
      availabilityStatus = room.hotel.needOrderConfirmAvailability
        ? AvailabilityStatus.waiting
        : AvailabilityStatus.systemVerified;
    }

    const amount = room.prices[0].price * +dto.quantity;
    const buyAmount = room.prices[0].buyPrice * +dto.quantity;

    await this.orderHotelMapRoomRepository
      .createQueryBuilder()
      .insert()
      .values({
        amount,
        buyAmount,
        quantity: dto.quantity,
        orderHotelId: orderHotel.id,
        hotelRoomId: dto.roomId,
        availabilityStatus,
      })
      .execute();

    // Updating hotel room with new reservedCount value
    // TODO:
    // await this.hotelRoomService.updateReservedCount(
    //   room.id,
    //   room.reservedCount + +dto.quantity,
    // );

    orderHotel.amount += amount;
    orderHotel.buyAmount += buyAmount;
    await orderHotel.save();

    orderHotel.invoice.amount += amount;
    orderHotel.invoice.buyAmount += buyAmount;
    await orderHotel.invoice.save();
  }

  /**
   * -------------------------------------------------------
   * DELETE /order-hotels/room
   */
  async deleteRoomByMapId(orderMapRoomId: number, tourismId: number = null) {
    const orderHotelMapRoom = await this.orderHotelMapRoomRepository.findOne({
      where: { id: orderMapRoomId },
      relations: ['orderHotel', 'hotelRoom', 'orderHotel.invoice'],
    });

    if (!orderHotelMapRoom) {
      this.error.unprocessableEntity(['اطلاعات ورودی نامعتبر است.']);
    }

    if (tourismId && tourismId !== orderHotelMapRoom.orderHotel.tourismId) {
      this.error.methodNotAllowed([
        'امکان ویرایش این سفارش برای شما، وجود ندارد.',
      ]);
    }

    if (orderHotelMapRoom.orderHotel.invoice.status !== InvoiceStatus.pending) {
      this.error.methodNotAllowed([
        'این پیش فاکتور تأیید شده است، امکان ویرایش در این وضعیت، وجود ندارد.',
      ]);
    }

    // Updating hotel room with new reservedCount value
    // TODO:
    // await this.hotelRoomService.updateReservedCount(
    //   orderHotelMapRoom.hotelRoomId,
    //   orderHotelMapRoom.hotelRoom.reservedCount - orderHotelMapRoom.quantity,
    // );

    const amountThatShouldRemoveFromOrder = orderHotelMapRoom.amount;
    const buyAmountThatShouldRemoveFromOrder = orderHotelMapRoom.buyAmount;

    orderHotelMapRoom.orderHotel.amount -= amountThatShouldRemoveFromOrder;
    orderHotelMapRoom.orderHotel.buyAmount -=
      buyAmountThatShouldRemoveFromOrder;
    await orderHotelMapRoom.orderHotel.save();

    orderHotelMapRoom.orderHotel.invoice.amount -=
      amountThatShouldRemoveFromOrder;
    orderHotelMapRoom.orderHotel.invoice.buyAmount -=
      buyAmountThatShouldRemoveFromOrder;
    await orderHotelMapRoom.orderHotel.invoice.save();

    // deleting from room mapping
    await this.orderHotelMapRoomRepository
      .createQueryBuilder()
      .delete()
      .where({ id: orderMapRoomId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   */
  calculateRoomPriceForCustomers(
    room: any,
    quantity: number,
    customers: CustomerEntity[],
    nights: number,
    sumOneNightFeatures: number,
  ) {
    let sumRoomPriceAllNights = room.seperatePrices.reduce(
      (acc, p) => acc + p.price,
      0,
    );
    let sumRoomPriceAllNights_buy = room.seperatePrices.reduce(
      (acc, p) => acc + p.buyPrice,
      0,
    );

    // add quantity
    sumRoomPriceAllNights *= quantity;
    sumRoomPriceAllNights_buy *= quantity;

    console.log('sumRoomPriceAllNights', sumRoomPriceAllNights);

    const totalMaxCapacity = room.maxCapacity * quantity;
    const totalMaxExtraCapacity = room.maxExtraCapacity * quantity;
    const countCustomers = customers.length;

    if (countCustomers > totalMaxCapacity + totalMaxExtraCapacity) {
      this.error.unprocessableEntity([
        `تعداد مسافران بیشتر از ظرفیت مجاز اتاق ${room.name} است`,
      ]);
    }

    console.log('customers', customers);

    if (countCustomers > totalMaxCapacity) {
      const countExtraCustomers = countCustomers - totalMaxCapacity;

      const childCustomers = [...customers]
        .sort((a, b) => a.age - b.age)
        .splice(-countExtraCustomers);

      childCustomers.forEach((chc) => {
        sumRoomPriceAllNights += room.seperatePrices.reduce((acc, p) => {
          const foundChildPrice = p.childPrices.find(
            (chp) => chp.ageFrom < chc.age && chp.ageTo >= chc.age,
          );

          let price = p.childExtraPrice || 0;
          if (foundChildPrice) {
            price = foundChildPrice.price;
          }
          return acc + price;
        }, 0);

        // buy
        sumRoomPriceAllNights_buy += room.seperatePrices.reduce((acc, p) => {
          const foundChildPrice = p.childPrices.find(
            (chp) => chp.ageFrom < chc.age && chp.ageTo >= chc.age,
          );

          let buyPrice = p.childExtraBuyPrice || 0;
          if (foundChildPrice) {
            buyPrice = foundChildPrice.buyPrice;
          }
          return acc + buyPrice;
        }, 0);
      });
    }

    const { adults } = seperateChildAndAdultList(customers);

    console.log('sumOneNightFeatures', sumOneNightFeatures);
    console.log('adults count', adults.length);
    console.log('nights', nights);

    const sumFeaturePriceAllNightsAllAdults =
      sumOneNightFeatures * adults.length * nights;

    console.log('seperatePrices', room.seperatePrices);
    console.log(
      'sumFeaturePriceAllNightsAllAdults',
      sumFeaturePriceAllNightsAllAdults,
    );
    console.log('totalMaxCapacity', totalMaxCapacity);
    console.log('countCustomers', countCustomers);
    console.log('sumRoomPriceAllNights + extras', sumRoomPriceAllNights);

    return {
      sale: sumRoomPriceAllNights + sumFeaturePriceAllNightsAllAdults,
      buy: sumRoomPriceAllNights_buy + sumFeaturePriceAllNightsAllAdults,
    };
  }

  /**
   * -------------------------------------------------------
    Fetching hotel room and calculating its price
   */
  async findHotelRoomAndCalculatePrice(
    room,
    hotelId,
    levelId,
    checkIn,
    checkOut,
    sumOneNightFeatures,
  ) {
    // Fetching room record by the room ID
    const roomRecord = await this.hotelRoomService.getHotelRoomSuggestionById(
      room.id,
      hotelId,
      levelId,
      checkIn,
      checkOut,
    );

    if (!roomRecord) {
      this.error.unprocessableEntity([`اتاق موردنظر یافت نشد!`]);
    }

    if (
      (roomRecord.maxCapacity + roomRecord.maxExtraCapacity) * room.quantity <
      room.customerIds.length
    ) {
      this.error.unprocessableEntity([
        `تعداد مسافرین شما بیشتر از ظرفیت انتخابی می‌باشد!`,
      ]);
    }

    // Counting the nights
    const nights = this.calculateCountNights(checkIn, checkOut);

    // Fetching customers record by customer Ids
    const customers = await this.customerService.getCustomersRecordByIds(
      room.customerIds, // [1, 2]
    );

    const { sale, buy } = this.calculateRoomPriceForCustomers(
      roomRecord,
      +room.quantity,
      customers,
      nights,
      sumOneNightFeatures,
    );

    return {
      ...roomRecord,
      quantity: room.quantity,
      customers,
      amount: sale,
      buyAmount: buy,
    };
  }

  /**
   * -------------------------------------------------------
    Fetching hotel map features
   */
  async findFeatures(featureIds, hotelId) {
    const mapFeatures = await this.hotelService.getHotelMapFeaturesByFeaturesId(
      featureIds.map((f) => +f),
      hotelId,
    );
    const sumOneNightFeatures = mapFeatures.reduce(
      (acc, mapFeature) =>
        acc + (mapFeature.isOptional ? +mapFeature.price : 0),
      0,
    );
    return { mapFeatures, sumOneNightFeatures };
  }

  /**
   * -------------------------------------------------------
   * Counting the nights
   */
  calculateCountNights(checkIn, checkOut) {
    const checkInMoment = moment(checkIn, 'YYYY-MM-DD');
    const checkOutMoment = moment(checkOut, 'YYYY-MM-DD');
    const nights = checkOutMoment.diff(checkInMoment, 'days');

    if (nights === 0) {
      this.error.unprocessableEntity([
        'باید حداقل یک شب برای رزرو این هتل انتخاب نمایید',
      ]);
    } else if (nights < 0) {
      this.error.unprocessableEntity([
        'تاریخ خروج نمی‌تواند قبل از تاریخ ورود به هتل باشد',
      ]);
    }

    return nights;
  }

  /**
   * -------------------------------------------------------
   */
  async getOrderHotelRecordById(orderHotelId: number) {
    return await this.orderHotelRepository.findOne(orderHotelId);
  }

  /**
   * -------------------------------------------------------
   */
  async updateById(orderHotelId: number, values: any) {
    await this.orderHotelRepository
      .createQueryBuilder()
      .update()
      .set(values)
      .where({ id: orderHotelId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * POST /order-hotels/calculate
   */
  async initializeDataForCreatingOrderHotel(
    dto: CreateOrderHotelDto,
    tourismId = null,
    tourismLevelId = null,
  ) {
    let levelId = tourismLevelId;
    if (tourismId) {
      ({ levelId } = await this.tourismService.getRecordByTourismId(tourismId));
    }

    const hotelOffer =
      await this.hotelOfferService.getHotelOffersByHotelIdAndLevel(
        dto.hotelId,
        levelId,
      );
    const discount = hotelOffer?.discount > 0 ? hotelOffer.discount : 0;

    // Fetching hotel map features
    const { mapFeatures, sumOneNightFeatures } = await this.findFeatures(
      dto.featureIds,
      dto.hotelId,
    );

    console.log({ mapFeatures, sumOneNightFeatures });

    // Fetching hotel room and calculating its price
    const rooms = [];
    for (let i = 0; i < dto.rooms.length; i++) {
      const roomData = await this.findHotelRoomAndCalculatePrice(
        dto.rooms[i],
        dto.hotelId,
        levelId,
        dto.checkIn,
        dto.checkOut,
        sumOneNightFeatures,
      );
      rooms.push({
        ...roomData,
        discountAmount: (roomData.amount * discount) / 100,
        totalAmount: roomData.amount - (roomData.amount * discount) / 100,
      });
    }

    const amount = rooms.reduce((acc, r) => acc + r.amount, 0);
    const buyAmount = rooms.reduce((acc, r) => acc + r.buyAmount, 0);

    const discountAmount = (amount * discount) / 100;

    return {
      rooms,
      mapFeatures,
      amount,
      buyAmount,
      discountAmount,
      totalAmount: amount - discountAmount,
    };
  }

  /**
   * --------------------------------------------------------
   * generate number
   */
  private async _generateNumber(hotelCode) {
    const lastInvoice = await this.orderHotelRepository
      .createQueryBuilder('order')
      .andWhere('order.number LIKE :num', { num: `${hotelCode}-%` })
      .select(['order.number'])
      .orderBy('order.createdAt', 'DESC')
      .getOne();

    if (!lastInvoice) {
      return `${hotelCode}-1000`;
    }
    const num = String(+lastInvoice.number.replace(`${hotelCode}-`, '') + 1);
    return `${hotelCode}-${num}`;
  }

  /**
   * -------------------------------------------------------
   * POST /order-hotels/send-email-to-hotel
   */
  async sendEmailToHotel(orderHotelId: number) {
    const orderHotel = await this.orderHotelRepository
      .createQueryBuilder('orderHotel')
      .innerJoinAndSelect('orderHotel.orderHotelMapRooms', 'orderHotelMapRooms')
      .innerJoinAndSelect('orderHotelMapRooms.hotelRoom', 'room')
      .innerJoinAndSelect('room.hotel', 'hotel')
      .where({ id: orderHotelId })
      .getOne();

    if (!orderHotel) {
      this.error.unprocessableEntity(['سفارشی یافت نشد']);
    }

    const hotel = orderHotel.orderHotelMapRooms[0]?.hotelRoom?.hotel;

    if (!hotel.email) {
      this.error.unprocessableEntity(['فاکتوری یافت نشد']);
    }

    if (!orderHotel.voucherReserveFile) {
      this.error.unprocessableEntity([
        'ووچر هتل هنوز صادر نشده است، ابتدا فاکتور را تایید نمایید',
      ]);
    }

    try {
      await this.mail.sendToHotel({
        to: hotel.email,
        data: {
          managerName: hotel.managerName,
          hotelName: hotel.name,
          filePath: path.join(
            __dirname,
            '../../..',
            'uploads',
            orderHotel.voucherReserveFile,
          ),
        },
      });
    } catch (e) {
      console.log('ERROR, SEND EMAIL TO HOTEL', e);
    }
  }

  /**
   * -------------------------------------------------------
   */
  private _getAllBuilder(
    tourismId: number,
    filters,
    hasTransfer: boolean,
    canGetFinancialInfo = false,
  ) {
    let builder = this.orderHotelRepository
      .createQueryBuilder('order')
      .leftJoin('order.invoice', 'invoice')
      .leftJoin('order.tourism', 'tourism')
      .leftJoin('order.user', 'user')
      .leftJoin('order.orderHotelMapRooms', 'orderMapRooms')
      .leftJoin('orderMapRooms.hotelRoom', 'hotelRoom')
      .leftJoin('hotelRoom.hotel', 'hotel');

    const attributes = [
      'order.id',
      'order.number',
      'order.invoiceId',
      'order.amount',
      'order.discountAmount',
      'order.totalAmount',
      'order.checkIn',
      'order.checkOut',
      'order.voucherReserveFile',
      'order.voucherPassengerFile',
      'order.arrivalDate',
      'order.createdAt',

      'invoice.id',
      'invoice.number',
      'invoice.systemNumber',
      'invoice.tourismNumber',
      'invoice.status',

      'orderMapRooms.id',
      'orderMapRooms.availabilityStatus',

      'hotelRoom.id',
      'hotelRoom.name',
      'hotelRoom.type',

      'hotel.id',
      'hotel.name',
      'hotel.city',
      'hotel.state',

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

    if (hasTransfer) {
      builder.andWhere('order.arrivalDate IS NOT NULL');
    }
    if (canGetFinancialInfo) {
      attributes.push('order.buyAmount');
    }
    builder.select(attributes);

    return builder;
  }

  private async _getSum(tourismId: number, filters, hasTransfer: boolean) {
    let builder = this.orderHotelRepository
      .createQueryBuilder('order')
      .leftJoin('order.invoice', 'invoice')
      .select('SUM(order.totalAmount) as sumTotalAmount');

    builder = applyFiltersToBuilder(builder, filters);

    // For tourism manager
    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    if (hasTransfer) {
      builder.andWhere('order.arrivalDate IS NOT NULL');
    }

    const result = await builder.getRawOne();
    return result.sumTotalAmount;
  }
}
