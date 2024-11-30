import { InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'jalali-moment';
import * as path from 'path';
import { Queue } from 'bull';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from 'src/utils';
import { In, Repository } from 'typeorm';
import { CustomerService } from '../customer/customer.service';
import { OrderHotelService } from '../order-hotel/order-hotel.service';
// import { OrderTourService } from '../order-tour/order-tour.service';
import { SettingService } from '../setting/setting.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceCustomerEntity } from './entities/invoice-customer.entity';
import {
  InvoiceEntity,
  InvoicePassengersInfoStatus,
  InvoiceStatus,
} from './entities/invoice.entity';
import { ErrorService } from 'src/error/error.service';
import { generateReservePDF } from './pdf/pdf.reserve';
import { generateBuyPDF } from './pdf/pdf.buy';
import { generateSalePDF } from './pdf/pdf.sale';
import { MailService } from 'src/mail/mail.service';
import { ConfigurationService } from 'src/config/configuration.service';
import { UserService } from '../user/user.service';
import { WalletType } from '../user/entities/user-wallet-history.entity';
import { TourismService } from '../tourism/tourism.service';
import { HotelRoomService } from '../hotel-room/hotel-room.service';
import { generatePassengerPDFV2 } from './pdf/pdf.passenger.v2';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypes } from '../notification/entities/notification.entity';
import { UpdateInvoiceCustomerDto } from './dto/update-invoice-customer.dto';
import { generateTourPassengerPDF } from './pdf/pdf.tour-passenger';
import { OrderTourService } from '../order-tour/order-tour.service';
import { TransferService } from '../transfer/transfer.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectQueue('queue') private queue: Queue,

    @InjectRepository(InvoiceEntity)
    private invoiceRepository: Repository<InvoiceEntity>,

    @InjectRepository(InvoiceCustomerEntity)
    private invoiceCustomerRepository: Repository<InvoiceCustomerEntity>,

    private userService: UserService,
    private settingService: SettingService,
    private customerService: CustomerService,
    private error: ErrorService,
    private tourismService: TourismService,
    private mail: MailService,
    private config: ConfigurationService,
    private hotelRoomService: HotelRoomService,
    private notificationService: NotificationService,
    private transferService: TransferService,

    // @Inject(forwardRef(() => OrderTourService))
    // private orderTourService: OrderTourService,

    @Inject(forwardRef(() => OrderHotelService))
    private readonly orderHotelService: OrderHotelService,

    @Inject(forwardRef(() => OrderTourService))
    private readonly orderTourService: OrderTourService,
  ) {}

  /**
   * -------------------------------------------------------
   * POST /invoices/send-email-to-hotel
   */
  async sendEmailToHotel(invoiceId: number) {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.orderHotels', 'orderHotels')
      .innerJoinAndSelect(
        'orderHotels.orderHotelMapRooms',
        'orderHotelMapRooms',
      )
      .innerJoinAndSelect('orderHotelMapRooms.hotelRoom', 'room')
      .innerJoinAndSelect('room.hotel', 'hotel')
      .where({ id: invoiceId })
      .getOne();

    if (!invoice) {
      this.error.unprocessableEntity(['فاکتوری یافت نشد']);
    }

    for (let i = 0; i < invoice.orderHotels.length; i++) {
      const orderHotel = invoice.orderHotels[i];
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
  }

  /**
   * -------------------------------------------------------
   * POST /invoices
   * add new invoice
   */
  async addInvoice(userId: number, tourismId: number, dto: CreateInvoiceDto) {
    // const orderHotels: OrderHotelEntity[] = [];
    // const orderTours: OrderTourEntity[] = [];

    // let sumAmount = 0;
    // let sumBuyAmount = 0;
    // let sumDiscountAmount = 0;
    // let sumTotalAmount = 0;

    // if (dto.orderHotelIds) {
    //   for (let p = 0; p < dto.orderHotelIds.length; p++) {
    //     const orderHotel = await this.orderHotelService.getOrderHotelRecordById(
    //       dto.orderHotelIds[p],
    //     );
    //     sumAmount += orderHotel.amount;
    //     sumBuyAmount += orderHotel.buyAmount;
    //     sumDiscountAmount += orderHotel.discountAmount;
    //     sumTotalAmount += orderHotel.totalAmount; // totalAmount = amount - discountAmount

    //     orderHotels.push(orderHotel);
    //   }
    // }

    // if (dto.orderTourIds) {
    //   for (let p = 0; p < dto.orderTourIds.length; p++) {
    //     const orderTour = await this.orderTourService.getOrderTourRecordById(
    //       dto.orderTourIds[p],
    //     );
    //     sumAmount += orderTour.amount;
    //     orderTours.push(orderTour);
    //   }
    // }

    const number = dto.number || (await this._generateNumber());
    const systemNumber =
      dto.systemNumber || (await this._generateSystemNumber(tourismId));
    const tourismNumber = await this._generateTourismNumber(
      tourismId,
      dto.tourismNumber,
    );

    let transfer;
    if (dto.transferId) {
      transfer = await this.transferService.getTransferById(
        dto.transferId,
        1,
        null,
        true,
      );
    }

    const { identifiers } = await this.invoiceRepository
      .createQueryBuilder()
      .insert()
      .values({
        ...dto,
        status: InvoiceStatus.pending,
        passengersInfoStatus: InvoicePassengersInfoStatus.waiting,
        userId,
        tourismId,
        transferId: transfer?.id || null,
        amount: transfer?.price || 0,
        buyAmount: transfer?.buyPrice || 0,
        discountAmount: 0,
        totalAmount: transfer?.price || 0,
        transferAmount: transfer?.price || 0,
        transferBuyAmount: transfer?.buyPrice || 0,
        number,
        tourismNumber,
        systemNumber,
        createdAt: new Date(),
      })
      .execute();

    const newInvoiceId = identifiers[0].id;

    // Fetching customers record by customer Ids
    const customers = await this.customerService.getCustomersRecordByIds(
      dto.customerIds,
    );

    // Inserting into invoice customer
    await this.addInvoiceCustomers(
      customers.map((customer, index) => ({
        invoiceId: newInvoiceId,
        customerId: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        gender: customer.gender,
        mobile: customer.mobile,
        email: customer.email,
        birthday: customer.birthday,
        age: customer.age,
        disability: customer.disability,
        identityCardFile: customer.identityCardFile,
        identityCardNumber: customer.identityCardNumber,
        passportFile: customer.passportFile,
        passportNumber: customer.passportNumber,
        isLeader: index === 0,
        createdAt: new Date(),
      })),
    );

    // // Updating the order hotel record with invoice ID
    // if (orderHotels?.length > 0) {
    //   for (let p = 0; p < orderHotels.length; p++) {
    //     orderHotels[p].invoiceId = newInvoiceId;
    //     await orderHotels[p].save();
    //   }
    // }

    // // Updating the order tour record with invoice ID
    // if (orderTours?.length > 0) {
    //   for (let p = 0; p < orderTours.length; p++) {
    //     orderTours[p].invoiceId = newInvoiceId;
    //     await orderTours[p].save();
    //   }
    // }

    // Updating the invoice customers with new invoiceId
    // await this.invoiceCustomerRepository
    //   .createQueryBuilder()
    //   .update()
    //   .set({ invoiceId: newInvoiceId })
    //   .whereInIds(dto.invoiceCustomerIds)
    //   .execute();

    // edited
    if (dto.number) {
      if (tourismId) {
        // Sending a notif to admin
        const tourism = await this.tourismService.getRecordByTourismId(
          tourismId,
        );
        await this.notificationService.add({
          type: NotificationTypes.invoice,
          sourceId: newInvoiceId,
          message: `فاکتور شماره ${systemNumber} توسط آژانس "${tourism.name}" ویرایش شد`,
        });
      } else {
        // Sending a notif to tourism
        const newInvoice = await this.invoiceRepository.findOne(newInvoiceId);
        if (newInvoice.tourismId) {
          await this.notificationService.add({
            tourismId: newInvoice.tourismId || null,
            type: NotificationTypes.invoice,
            sourceId: newInvoiceId,
            message: `فاکتور شماره ${tourismNumber} توسط مدیر سیستم ویرایش شد`,
          });
        }
      }
    }
    // new added
    else {
      if (tourismId) {
        // Sending a notif to admin
        const tourism = await this.tourismService.getRecordByTourismId(
          tourismId,
        );
        await this.notificationService.add({
          type: NotificationTypes.invoice,
          sourceId: newInvoiceId,
          message: `سفارش جدید توسط آژانس "${tourism.name}" ثبت شد`,
        });
      } else {
        // Sending an email to admin
        try {
          await this.mail.notifyNewOrderToAdmin({
            to: this.config.mail.defaultEmail,
            data: {
              invoiceNumber: systemNumber || number,
            },
          });
        } catch (e) {
          console.log('ERROR, SEND EMAIL TO ADMIN LIQOTRIP', e);
        }
      }
    }

    return newInvoiceId;
  }

  /**
   * -------------------------------------------------------
   * PUT /invoices/1
   */
  async updateInvoice(invoiceId: number, dto: UpdateInvoiceDto) {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.tourism', 'tourism')
      .leftJoinAndSelect('tourism.admin', 'admin')
      .leftJoinAndSelect('invoice.orderHotels', 'orderHotels')
      .leftJoinAndSelect('orderHotels.orderHotelMapRooms', 'orderHotelMapRooms')
      .leftJoinAndSelect(
        'orderHotelMapRooms.invoiceCustomers',
        'invoiceCustomers',
      )
      .leftJoinAndSelect('orderHotelMapRooms.hotelRoom', 'room')
      .leftJoinAndSelect('room.hotel', 'hotel')

      .leftJoinAndSelect('invoice.orderTours', 'orderTours')
      .leftJoinAndSelect('orderTours.tour', 'tour')
      .leftJoinAndSelect('orderTours.invoiceCustomers', 'invoiceTourCustomers')
      .where({ id: invoiceId })
      .getOne();

    if (!invoice) {
      this.error.unprocessableEntity(['فاکتوری یافت نشد']);
    }

    console.log(invoice);

    // const { passengersInfoUpdateDeadlineHours } = await this.settingService.get(
    //   ['passengersInfoUpdateDeadlineHours'],
    // );
    // if (
    //   passengersInfoUpdateDeadlineHours &&
    //   dto.passengersInfoStatus === InvoicePassengersInfoStatus.rejected
    // ) {
    //   try {
    //     await this.queue.add(
    //       'info-passenger-deadline',
    //       { invoiceId },
    //       { delay: passengersInfoUpdateDeadlineHours * 1000 * 60 * 60 },
    //     );
    //   } catch (e) {
    //     console.error(e);
    //     this.error.forbidden(['خطای غیرمنتظره ای رخ داده است']);
    //   }
    // }

    const updatedValues: any = { ...dto, updatedAt: new Date() };

    if (
      dto.status === InvoiceStatus.accepted ||
      dto.status === InvoiceStatus.done
    ) {
      updatedValues.invoiceBuyFile = generateBuyPDF(invoice);

      // send email to self
      try {
        await this.mail.sendToSelf({
          to: this.config.mail.defaultEmail,
          data: {
            filePath: path.join(
              __dirname,
              '../../..',
              'uploads',
              updatedValues.invoiceBuyFile,
            ),
            invoiceNumber: invoice.systemNumber || invoice.number,
          },
        });
      } catch (e) {
        console.log('ERROR, SEND EMAIL TO ADMIN LIQOTRIP', e);
      }

      updatedValues.invoiceSaleFile = generateSalePDF(invoice);

      const passengerFilePaths = [];
      for (let i = 0; i < invoice.orderHotels.length; i++) {
        const orderHotel = invoice.orderHotels[i];
        // const hotel = orderHotel.orderHotelMapRooms[0]?.hotelRoom?.hotel;

        const setting = await this.settingService.get([
          'voucherDescription',
          'transferBoard',
          'transferPhone',
          'transferPhone2',
          'transferExcursion',
          'adminName',
          'adminPhone',
          'adminFax',
          'adminEmail',
        ]);

        // Generating pdf passenger
        const passengerPath = generatePassengerPDFV2(orderHotel, setting);
        passengerFilePaths.push(
          path.join(__dirname, '../../..', 'uploads', passengerPath),
        );

        // Generating the hotel reserve PDF and sending an email to hotel manager
        const reservePath = generateReservePDF(orderHotel, setting);
        // if (hotel?.email) {
        //   try {
        //     await this.mail.sendToHotel({
        //       to: hotel.email,
        //       data: {
        //         managerName: hotel.managerName,
        //         hotelName: hotel.name,
        //         filePath: path.join(
        //           __dirname,
        //           '../../..',
        //           'uploads',
        //           reservePath,
        //         ),
        //       },
        //     });
        //   } catch (e) {
        //     console.log('ERROR, SEND EMAIL TO HOTEL', e);
        //   }
        // }

        // update order hotel with passengerPath & reservePath
        // await this.orderHotelService.update(orderHotel.id, {})
        await this.orderHotelService.updateById(orderHotel.id, {
          voucherPassengerFile: passengerPath,
          voucherReserveFile: reservePath,
        });
      }

      const hotelName =
        invoice.orderHotels?.[0]?.orderHotelMapRooms?.[0]?.hotelRoom?.hotel
          ?.name || '';

      for (let i = 0; i < invoice.orderTours.length; i++) {
        const orderTour = invoice.orderTours[i];

        // Generating pdf passenger
        const passengerPath = generateTourPassengerPDF(
          orderTour,
          hotelName,
          invoice.tourismNumber,
        );
        passengerFilePaths.push(
          path.join(__dirname, '../../..', 'uploads', passengerPath),
        );

        await this.orderTourService.updateById(orderTour.id, {
          voucherPassengerFile: passengerPath,
        });
      }

      // send email to agancy
      if (invoice?.tourism?.admin?.email) {
        try {
          await this.mail.sendToAgency({
            to: invoice.tourism.admin.email,
            data: {
              agencyName: invoice.tourism.name,
              tourismFilePath: path.join(
                __dirname,
                '../../..',
                'uploads',
                updatedValues.invoiceSaleFile,
              ),
              passengerFilePaths,
              invoiceNumber:
                invoice.tourismNumber || invoice.systemNumber || invoice.number,
              managerName: `${invoice.tourism.admin.firstName} ${invoice.tourism.admin.lastName}`,
            },
          });
        } catch (e) {
          console.log('ERROR, SEND EMAIL TO ADMIN TOURISM', e);
        }
      }
    }

    if (
      invoice.status !== InvoiceStatus.accepted &&
      dto.status === InvoiceStatus.accepted
    ) {
      // Sending a notif to tourism
      await this.notificationService.add({
        tourismId: invoice.tourismId,
        type: NotificationTypes.invoice,
        sourceId: invoice.id,
        message: `فاکتور شماره ${invoice.tourismNumber} توسط مدیر سیستم تایید شد و در انتظار پرداخت شما می‌باشد`,
      });
    }

    if (
      invoice.status !== InvoiceStatus.rejected &&
      dto.status === InvoiceStatus.rejected
    ) {
      // Sending a notif to tourism
      await this.notificationService.add({
        tourismId: invoice.tourismId,
        type: NotificationTypes.invoice,
        sourceId: invoice.id,
        message: `فاکتور شماره ${invoice.tourismNumber} توسط مدیر سیستم رد شد`,
      });
    }

    return await this.invoiceRepository
      .createQueryBuilder()
      .update()
      .set(updatedValues)
      .where({ id: invoiceId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * GET /invoices
   */
  async getInvoices(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    tourismId = null,
    canGetFinancialInfo = false,
  ) {
    let builder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.user', 'user')
      .leftJoin('invoice.tourism', 'tourism')
      .leftJoin('invoice.payment', 'payment');

    const attributes = [
      'invoice.id',
      'invoice.number',
      'invoice.systemNumber',
      'invoice.tourismNumber',
      'invoice.amount',
      'invoice.discountAmount',
      'invoice.totalAmount',
      'invoice.passengersInfoStatus',
      'invoice.status',
      'invoice.reasonRejected',
      'invoice.createdAt',

      'tourism.id',
      'tourism.name',

      'user.firstName',
      'user.lastName',

      'payment.id',
      'payment.method',
      'payment.status',
      'payment.reasonRejected',
    ];

    // For tourism manager
    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    if (canGetFinancialInfo) {
      attributes.push('invoice.buyAmount');
    }

    builder.select(attributes);

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('invoice.createdAt', 'DESC');
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
   * GET /invoices/1
   */
  async getInvoiceById(
    invoiceId: number,
    tourismId: number = null,
    canGetFinancialInfo = false,
  ) {
    const builder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.user', 'user')
      .leftJoin('invoice.tourism', 'tourism')
      .leftJoin('invoice.payment', 'payment')

      .leftJoin('invoice.orderHotels', 'orderHotels')
      .leftJoin('invoice.orderTours', 'orderTours')
      .leftJoin('invoice.transfer', 'transfer')

      .leftJoin('orderHotels.orderHotelMapFeatures', 'orderHotelMapFeatures')
      .leftJoin('orderHotelMapFeatures.hotelFeature', 'hotelFeature')

      .leftJoin('orderTours.orderTourMapFeatures', 'orderTourMapFeatures')
      .leftJoin('orderTourMapFeatures.tourFeature', 'tourFeature')

      .leftJoin('orderHotels.orderHotelMapRooms', 'orderHotelMapRooms')
      .leftJoin('orderHotelMapRooms.invoiceCustomers', 'roomInvoiceCustomers')
      .leftJoin('roomInvoiceCustomers.customer', 'roomCustomer')
      .leftJoin('orderHotelMapRooms.hotelRoom', 'hotelRoom')
      .leftJoin('hotelRoom.hotel', 'hotel')
      .leftJoin('hotel.cover', 'hotelCover')

      .leftJoin('orderTours.tour', 'tour')
      .leftJoin('tour.cover', 'tourCover')
      .leftJoin('orderTours.invoiceCustomers', 'tourInvoiceCustomers')
      .leftJoin('tourInvoiceCustomers.customer', 'tourCustomer')

      .leftJoin('invoice.invoiceCustomers', 'invoiceCustomers')
      .leftJoin('invoiceCustomers.customer', 'customer');

    const attributes = [
      'invoice.id',
      'invoice.number',
      'invoice.systemNumber',
      'invoice.tourismNumber',
      'invoice.amount',
      'invoice.discountAmount',
      'invoice.totalAmount',
      'invoice.transferAmount',
      'invoice.passengersInfoStatus',
      'invoice.status',
      'invoice.reasonRejected',
      'invoice.invoiceSaleFile',
      'invoice.createdAt',

      'tourism.id',
      'tourism.name',

      'user.id',
      'user.firstName',
      'user.lastName',

      'payment.id',
      'payment.method',
      'payment.status',
      'payment.reasonRejected',

      'orderHotels.id',
      'orderHotels.amount',
      'orderHotels.discountAmount',
      'orderHotels.totalAmount',
      'orderHotels.checkIn',
      'orderHotels.checkOut',
      'orderHotels.description',
      'orderHotels.arrivalAirline',
      'orderHotels.arrivalDate',
      'orderHotels.arrivalNumber',
      'orderHotels.departureAirline',
      'orderHotels.departureDate',
      'orderHotels.departureNumber',

      'orderHotelMapRooms.id',
      'orderHotelMapRooms.amount',
      'orderHotelMapRooms.availabilityStatus',
      'orderHotelMapRooms.quantity',
      'orderHotelMapRooms.amount',

      'roomInvoiceCustomers.id',
      'roomCustomer.id',

      'hotelRoom.id',
      'hotelRoom.name',
      'hotelRoom.type',
      'hotelRoom.maxCapacity',
      'hotelRoom.maxExtraCapacity',

      'hotel.id',
      'hotel.name',
      'hotelCover.id',
      'hotelCover.pathFile',

      'orderHotelMapFeatures.id',
      'orderHotelMapFeatures.price',

      'hotelFeature.id',
      'hotelFeature.title',
      'hotelFeature.icon',

      'orderTours.id',
      'orderTours.amount',
      'orderTours.commission',
      'orderTours.description',
      'orderTours.countCustomer',
      'orderTours.voucherPassengerFile',

      'tour.id',
      'tour.name',
      // 'tour.from',
      // 'tour.to',
      // 'tour.originCity',
      'tour.destinationCity',
      'tourCover.id',
      'tourCover.pathFile',

      'tourInvoiceCustomers.id',
      'tourCustomer.id',

      'orderTourMapFeatures.id',
      'orderTourMapFeatures.price',

      'tourFeature.id',
      'tourFeature.title',
      'tourFeature.icon',

      'invoiceCustomers.id',
      'invoiceCustomers.customerId',
      'invoiceCustomers.firstName',
      'invoiceCustomers.lastName',
      'invoiceCustomers.gender',
      'invoiceCustomers.mobile',
      'invoiceCustomers.email',
      'invoiceCustomers.birthday',
      'invoiceCustomers.age',
      'invoiceCustomers.disability',
      'invoiceCustomers.identityCardFile',
      'invoiceCustomers.identityCardNumber',
      'invoiceCustomers.passportFile',
      'invoiceCustomers.passportNumber',
      'invoiceCustomers.isLeader',

      'customer.id',
      'customer.firstName',
      'customer.lastName',
      'customer.gender',
      'customer.mobile',
      'customer.email',
      'customer.birthday',
      'customer.age',
      'customer.disability',
      'customer.identityCardFile',
      'customer.identityCardNumber',
      'customer.passportFile',
      'customer.passportNumber',

      'transfer.id',
      'transfer.name',
      'transfer.description',
    ];

    // For tourism manager
    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    if (canGetFinancialInfo) {
      attributes.push('invoice.buyAmount');
      attributes.push('orderHotels.buyAmount');
      attributes.push('orderTours.buyAmount');
      attributes.push('orderHotelMapRooms.buyAmount');
      attributes.push('invoice.invoiceBuyFile');
      attributes.push('invoice.transferBuyAmount');
    }

    builder.select(attributes);

    const data = await builder.where({ id: invoiceId }).getOne();
    if (!data) {
      this.error.methodNotAllowed(['فاکتور مورد نظر یافت نشد']);
    }

    return data;
  }

  /**
   * -------------------------------------------------------
   */
  async rejectedPassengersUpdateDeadline(invoiceId: number) {
    return await this.invoiceRepository
      .createQueryBuilder()
      .update()
      .set({
        status: InvoiceStatus.rejected,
        reasonRejected: 'وضعیت فاکتور به دلیل مشکل در اطلاعات مسافرین، رد شد.',
        updatedAt: new Date(),
      })
      .where({ id: invoiceId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   */
  async getCountPassengersReserved() {
    const { count } = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .innerJoin('invoice.invoiceCustomers', 'invoiceCustomers')
      .andWhere('(status = :done OR status = :accepted)', {
        done: InvoiceStatus.done,
        accepted: InvoiceStatus.accepted,
      })
      .select(['COUNT(invoiceCustomers.id) AS count'])
      .getRawOne();

    return +count;
  }

  /**
   * -------------------------------------------------------
   */
  async getStatisticByStatus() {
    const list = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .groupBy('invoice.status')
      .select(['invoice.status AS status', 'COUNT(invoice.id) AS count'])
      .getRawMany();

    // return Object.values(InvoiceStatus).map((status) => ({
    //   status,
    //   count: +list.find((data) => data.status === status)?.count || 0,
    // }));

    const result = {};
    Object.values(InvoiceStatus).forEach((status) => {
      result[status] = +list.find((data) => data.status === status)?.count || 0;
    });
    return result;
  }

  /**
   * -------------------------------------------------------
   */
  async getIncomeStatistic() {
    const chart = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .groupBy('DATE(invoice.createdAt)')
      .select([
        'DATE(invoice.createdAt) AS date',
        'SUM(invoice.amount) AS income',
      ])
      .andWhere({ status: InvoiceStatus.done })
      .orderBy('invoice.createdAt', 'DESC')
      .limit(20)
      .getRawMany();

    const { income } = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select(['SUM(invoice.amount) AS income'])
      .andWhere({ status: InvoiceStatus.done })
      .getRawOne();

    return {
      chart: chart
        .map((item) => ({
          date: moment(item.date).format('jYYYY-jMM-jDD'),
          income: +item.income,
        }))
        .reverse(),
      income: +income,
    };
  }

  /**
   * -------------------------------------------------------
   */
  async getCountCheckInCheckOut() {
    const { checkInCount, checkOutCount } = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.orderHotels', 'orderHotels')
      .andWhere('status = :done', { done: InvoiceStatus.done })
      // .andWhere('DATE(NOW()) = room.checkIn OR DATE(NOW()) = room.checkOut')
      .select([
        // 'COUNT(order.id) AS checkInCount',
        // 'COUNT(order.id) AS checkOutCount',
        'SUM(if(orderHotels.checkIn = DATE(NOW()), 1, 0)) AS checkInCount',
        'SUM(if(orderHotels.checkOut = DATE(NOW()), 1, 0)) AS checkOutCount',
      ])
      .getRawOne();

    return { checkInCount: +checkInCount, checkOutCount: +checkOutCount };
  }

  /**
   * -------------------------------------------------------
   */
  async rejectUnpaidInvoices() {
    const list = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.orderHotels', 'orderHotels')
      .andWhere({ status: InvoiceStatus.accepted })
      // TODO: add order tour
      .andWhere('orderHotels.checkIn < :date', {
        date: moment().add(48, 'hour').toDate(),
      })
      .getMany();

    if (list.length > 0) {
      await this.invoiceRepository
        .createQueryBuilder('invoice')
        .update()
        .set({
          status: InvoiceStatus.rejected,
          reasonRejected: 'وضعیت فاکتور به دلیل تأخیر در پرداخت، رد شد',
          updatedAt: new Date(),
        })
        .andWhere('invoice.id IN (:...ids)', {
          ids: list.map((item) => item.id), // [1,2,3]
        })
        .execute();
    }

    return true;
  }

  /**
   * -------------------------------------------------------
   */
  async findByIdAndTourismId(id: number, tourismId: number) {
    return await this.invoiceRepository.findOne({
      id,
      tourismId,
      status: InvoiceStatus.accepted,
    });
  }

  /**
   * -------------------------------------------------------
   */
  async findByIdForPay(id: number) {
    return await this.invoiceRepository.findOne({
      where: {
        id,
        status: InvoiceStatus.accepted,
      },
      relations: ['tourism'],
    });
  }

  /**
   * -------------------------------------------------------
   */
  async updateById(id: number, values: any) {
    return await this.invoiceRepository
      .createQueryBuilder()
      .update()
      .set({ ...values, updatedAt: new Date() })
      .where({ id })
      .execute();
  }

  /**
   * --------------------------------------------------------
   * generate factor number
   */
  private async _generateNumber() {
    const lastInvoice = await this.invoiceRepository.findOne({
      select: ['number'],
      order: { number: 'DESC' },
    });

    if (!lastInvoice) {
      return '1000000000';
    }
    return String(+lastInvoice.number + 1);
  }

  /**
   * --------------------------------------------------------
   * generate invoice system number
   */
  private async _generateSystemNumber(tourismId) {
    if (!tourismId) return null;

    const { code } = await this.tourismService.getCodeById(tourismId);

    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .andWhere('invoice.tourismId = :tourismId', { tourismId })
      .select(['invoice.systemNumber'])
      .orderBy('invoice.createdAt', 'DESC')
      .getOne();

    if (!lastInvoice) {
      return `${code}-1000`;
    }
    const num = String(+lastInvoice.systemNumber.replace(`${code}-`, '') + 1);
    return `${code}-${num}`;
  }

  /**
   * --------------------------------------------------------
   * generate invoice tourism number
   */
  private async _generateTourismNumber(
    tourismId: number,
    customTourismNumber: string = null,
  ) {
    if (!tourismId) return customTourismNumber || null;

    const { code } = await this.tourismService.getCodeById(tourismId);

    if (customTourismNumber) {
      return `${code}-${customTourismNumber.replace(`${code}-`, '')}`;
    }

    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .andWhere('invoice.tourismId = :tourismId', { tourismId })
      .select(['invoice.tourismNumber'])
      .orderBy('invoice.createdAt', 'DESC')
      .getOne();

    if (!lastInvoice) {
      return `${code}-1000`;
    }
    const num = String(+lastInvoice.tourismNumber.replace(`${code}-`, '') + 1);
    return `${code}-${num}`;
  }

  /**
   * --------------------------------------------------------
   */
  async findRecordById(invoiceId: number) {
    return await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });
  }

  /**
   * --------------------------------------------------------
   */
  async addInvoiceCustomers(values) {
    const newRecords = await this.invoiceCustomerRepository
      .createQueryBuilder()
      .insert()
      .values(values)
      .execute();

    return newRecords.identifiers.map((i) => i.id);
  }

  /**
   * --------------------------------------------------------
   */
  async updateCustomerByInvoiceIdAndCustomerIds(
    invoiceId,
    customerIds,
    values: any,
  ) {
    await this.invoiceCustomerRepository
      .createQueryBuilder()
      .update()
      .set(values)
      .where({ invoiceId, customerId: In(customerIds) })
      .execute();
  }

  /**
   * --------------------------------------------------------
   */
  async setCommissionHotel(invoiceId: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: [
        'tourism',
        'tourism.level',
        'orderHotels',
        'orderHotels.orderHotelMapRooms',
        'orderHotels.orderHotelMapRooms.invoiceCustomers',
      ],
    });

    const level = invoice?.tourism?.level;

    if (!level) {
      return false;
    }

    let sumHotelPassengers = 0;
    invoice.orderHotels.forEach((orderHotel) => {
      // has transfer
      if (orderHotel.arrivalDate) {
        sumHotelPassengers += orderHotel.orderHotelMapRooms.reduce(
          (acc, map) => acc + map.invoiceCustomers.length,
          0,
        );
      }
    });

    if (sumHotelPassengers > 0) {
      const commisionHotelAmount =
        sumHotelPassengers * level.hotelCommissionPerPerson;

      // insert into wallet history
      await this.userService.addWalletHistory(
        invoice.tourism.adminId,
        invoice.tourismId,
        invoiceId,
        commisionHotelAmount,
        WalletType.commission,
      );

      await this.userService.updateWallet(
        invoice.tourism.adminId,
        commisionHotelAmount,
      );
    }
  }
  /**
   * --------------------------------------------------------
   */
  async setCommissionTour(invoiceId: number) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: [
        'tourism',
        'tourism.level',
        'orderTours',
        'orderTours.invoiceCustomers',
      ],
    });

    const level = invoice?.tourism?.level;

    if (!level) {
      return false;
    }

    const sumTourPassengers = invoice.orderTours.reduce(
      (acc, orderTour) => acc + orderTour.invoiceCustomers.length,
      0,
    );

    if (sumTourPassengers > 0) {
      const commisionTourAmount =
        sumTourPassengers * level.tourCommissionPerPerson;

      // insert into wallet history
      await this.userService.addWalletHistory(
        invoice.tourism.adminId,
        invoice.tourismId,
        invoiceId,
        commisionTourAmount,
        WalletType.commission,
      );

      await this.userService.updateWallet(
        invoice.tourism.adminId,
        commisionTourAmount,
      );
    }
  }

  /**
   * --------------------------------------------------------
   * DELETE /invoices/1
   */
  async deleteInvoice(invoiceId: number, tourismId: number) {
    const where: any = { id: invoiceId };
    if (tourismId) {
      where.tourismId = tourismId;
    }

    const invoice = await this.invoiceRepository.findOne({
      where,
      relations: [
        'invoiceCustomers',
        'orderHotels',
        'orderHotels.orderHotelMapRooms',
        'orderHotels.orderHotelMapFeatures',
        'orderTours',
        'orderTours.orderTourMapFeatures',
      ],
    });

    if (invoice.status !== InvoiceStatus.pending) {
      this.error.methodNotAllowed([
        'امکان ویرایش یا حذف فاکتور تایید شده وجود ندارد',
      ]);
    }

    try {
      // Remove customers
      for (let i = 0; i < invoice.invoiceCustomers.length; i++) {
        await invoice.invoiceCustomers[i].remove();
      }

      // Remove order hotels
      for (let i = 0; i < invoice.orderHotels.length; i++) {
        const orderHotels = invoice.orderHotels[i];

        for (let j = 0; j < orderHotels.orderHotelMapRooms.length; j++) {
          const mapRoom = orderHotels.orderHotelMapRooms[j];

          // Rollback room reserve count
          await this.hotelRoomService.updateReservedCount(
            mapRoom.hotelRoomId,
            orderHotels.checkIn,
            orderHotels.checkOut,
            -1 * mapRoom.quantity,
          );

          await mapRoom.remove();
        }
        for (let j = 0; j < orderHotels.orderHotelMapFeatures.length; j++) {
          await orderHotels.orderHotelMapFeatures[j].remove();
        }

        await orderHotels.remove();
      }

      // Remove order tours
      for (let i = 0; i < invoice.orderTours.length; i++) {
        const orderTours = invoice.orderTours[i];

        for (let j = 0; j < orderTours.orderTourMapFeatures.length; j++) {
          await orderTours.orderTourMapFeatures[j].remove();
        }

        await orderTours.remove();
      }

      // Remove invocie
      await invoice.remove();
    } catch (e) {
      console.log(e);
      this.error.internalServerError(['خطایی رخ داده است، دوباره تلاش کنید']);
    }
  }

  /**
   * -------------------------------------------------------
   * PUT /invoices/customer/1
   */
  async updateCustomer(
    invoiceCustomerId: number,
    dto: UpdateInvoiceCustomerDto,
    passportFile: Express.Multer.File[],
    identityCardFile: Express.Multer.File[],
  ) {
    const values = { ...dto };

    if (identityCardFile && identityCardFile.length > 0) {
      values.identityCardFile = `/customers/${identityCardFile[0].filename}`;
    }

    if (passportFile && passportFile.length > 0) {
      values.passportFile = `/customers/${passportFile[0].filename}`;
    }

    await this.invoiceCustomerRepository
      .createQueryBuilder()
      .update()
      .set(values)
      .where({ id: invoiceCustomerId })
      .execute();

    const passenger = await this.invoiceCustomerRepository.findOne({
      where: { id: invoiceCustomerId },
      relations: ['invoice'],
    });

    // Sending a notif to tourism
    await this.notificationService.add({
      tourismId: passenger.invoice.tourismId,
      type: NotificationTypes.invoice,
      sourceId: passenger.invoiceId,
      message: `اطلاعات مسافرین فاکتور ${passenger.invoice.tourismNumber} توسط مدیر سیستم ویرایش شد`,
    });

    // re-generating the PDFs
    await this.updateInvoice(passenger.invoiceId, {
      status: passenger.invoice.status,
    } as any);

    return passenger;
  }

  // /**
  //  * --------------------------------------------------------
  //  * fakePDF
  //  */
  // async fakePDF(invoiceId: number) {
  //   const invoice = await this.invoiceRepository
  //     .createQueryBuilder('invoice')
  //     .leftJoinAndSelect('invoice.tourism', 'tourism')
  //     .leftJoinAndSelect('tourism.admin', 'admin')

  //     .leftJoinAndSelect('invoice.orderHotels', 'orderHotels')
  //     .leftJoinAndSelect('orderHotels.orderHotelMapRooms', 'orderHotelMapRooms')
  //     .leftJoinAndSelect(
  //       'orderHotelMapRooms.invoiceCustomers',
  //       'invoiceCustomers',
  //     )
  //     .leftJoinAndSelect('orderHotelMapRooms.hotelRoom', 'room')
  //     .leftJoinAndSelect('room.hotel', 'hotel')

  //     .leftJoinAndSelect('invoice.orderTours', 'orderTours')
  //     .leftJoinAndSelect('orderTours.tour', 'tour')
  //     .leftJoinAndSelect('orderTours.invoiceCustomers', 'invoiceTourCustomers')
  //     .where({ id: invoiceId })
  //     .getOne();

  //   if (!invoice) {
  //     this.error.unprocessableEntity(['فاکتوری یافت نشد']);
  //   }

  //   const setting = await this.settingService.get([
  //     'voucherDescription',
  //     'transferBoard',
  //     'transferPhone',
  //     'transferPhone2',
  //     'transferExcursion',
  //     'adminName',
  //     'adminPhone',
  //     'adminFax',
  //     'adminEmail',
  //   ]);

  //   for (let i = 0; i < invoice.orderHotels.length; i++) {
  //     const orderHotel = invoice.orderHotels[i];

  //     // Generating pdf passenger
  //     // const path = generatePassengerPDFV2(orderHotel, setting);

  //     //////////////////////////////////////////////////////////////////////
  //     // const path = generateSalePDF(invoice);
  //     const path = generateBuyPDF(invoice);
  //     //////////////////////////////////////////////////////////////////////

  //     // const path = generateReservePDF(orderHotel, setting);

  //     console.log(path);
  //   }

  //   // const hotelName =
  //   //   invoice.orderHotels?.[0]?.orderHotelMapRooms?.[0]?.hotelRoom?.hotel
  //   //     ?.name || '';

  //   // for (let i = 0; i < invoice.orderTours.length; i++) {
  //   //   const orderTour = invoice.orderTours[i];

  //   //   const path = generateTourPassengerPDF(
  //   //     orderTour,
  //   //     hotelName,
  //   //     invoice.tourismNumber,
  //   //   );
  //   //   console.log(path);
  //   // }
  // }
}
