import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigurationService } from '../../config/configuration.service';
import { ErrorService } from '../../error/error.service';

import {
  PaymentEntity,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceService } from '../invoice/invoice.service';
import { RagaexService } from 'src/gateway/ragaex/ragaex.service';
import { InvoiceStatus } from '../invoice/entities/invoice.entity';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from 'src/utils';
import { SavePaymentTransferDto } from './dto/save-payment-transfer.dto';
import { UpadatePaymentDto } from './dto/update-payment.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypes } from '../notification/entities/notification.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,

    private error: ErrorService,
    private config: ConfigurationService,
    private invoiceService: InvoiceService,
    private notificationService: NotificationService,
    private ragaexService: RagaexService,
  ) {}

  /**
   * --------------------------------------------------------
   */
  async pay(dto: CreatePaymentDto, userId) {
    const invoice = await this.invoiceService.findByIdForPay(dto.invoiceId);

    if (!invoice) {
      this.error.unprocessableEntity(['درخواست شما نامعتبر است.']);
    }

    const unitCode = 'USD';
    const callbackUrl = `${this.config.app.apiBaseUrl}/payments/ragaex`;

    try {
      const { token, redirectUrl } = await this.ragaexService.pay(
        invoice.amount,
        unitCode,
        callbackUrl,
      );

      const { identifiers } = await this.paymentRepository
        .createQueryBuilder()
        .insert()
        .values({
          userId: userId || invoice.userId,
          tourismId: invoice.tourismId,
          amount: invoice.amount,
          randomToken: token,
          status: PaymentStatus.pending,
          method: PaymentMethod.online,
          createdAt: new Date(),
        })
        .execute();

      const newPaymentId = identifiers[0].id;

      // update invoice set paymentId by invoice ID
      await this.invoiceService.updateById(dto.invoiceId, {
        paymentId: newPaymentId,
      });

      return { redirectUrl };
    } catch (e) {
      console.log(e?.response?.data || e);
      this.error.internalServerError([
        'اتصال به درگاه برقرار نشد، لطفا مجدد تلاش کنید',
      ]);
    }
  }

  /**
   * --------------------------------------------------------
   */
  async saveTransfer(
    dto: SavePaymentTransferDto,
    transferFile: Express.Multer.File,
    userId,
  ) {
    const invoice = await this.invoiceService.findByIdForPay(dto.invoiceId);

    const { identifiers } = await this.paymentRepository
      .createQueryBuilder()
      .insert()
      .values({
        userId: userId || invoice.userId,
        tourismId: invoice.tourismId,
        amount: invoice.amount,
        transferFile: `/payments/${transferFile.filename}`,
        transferDescription: dto.transferDescription,
        status: PaymentStatus.pending,
        method: PaymentMethod.transfer,
        createdAt: new Date(),
      })
      .execute();

    const newPaymentId = identifiers[0].id;

    // update invoice set paymentId by invoice ID
    await this.invoiceService.updateById(dto.invoiceId, {
      paymentId: newPaymentId,
    });

    if (invoice.tourismId) {
      // Sending a notif to admin
      await this.notificationService.add({
        type: NotificationTypes.payment,
        sourceId: newPaymentId,
        message: `فیش بانکی توسط آژانس "${invoice.tourism.name}" برای فاکتور ${invoice.systemNumber} ثبت شد`,
      });
    }
  }

  /**
   * --------------------------------------------------------
   */
  async varifyRagaex(token: string, authority: string) {
    try {
      // find by token on payment
      const payment = await this.paymentRepository.findOne({
        where: {
          randomToken: token,
        },
        relations: ['invoices', 'invoices.tourism'],
      });

      // call ragaex verify
      const unitCode = 'USD';
      await this.ragaexService.verify(payment.amount, unitCode, authority);

      // update payment set status by id
      payment.status = PaymentStatus.done;
      await payment.save();

      // update invoice set status by invoice ID
      const invoice = payment.invoices[0];

      await this._complete(invoice.id);

      try {
        await this.notificationService.add({
          type: NotificationTypes.payment,
          sourceId: payment.id,
          message: `پرداخت آنلاین فاکتور ${invoice.systemNumber} توسط آژانس ${invoice.tourism.name} با موفقیت انجام شد`,
        });
      } catch (e) {}

      return `status=success&message=پرداخت با موفقیت انجام شد&invoice_id=${invoice.id}`;
    } catch (e) {
      console.log(e?.response?.data || e);

      return 'status=error&message=خطای غیرمنتظره ای رخ داده است&invoice_id=';
    }
  }

  /**
   * -------------------------------------------------------
   * GET /payments
   */
  async getPayments(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    tourismId = null,
  ) {
    let builder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.user', 'user')
      .leftJoin('payment.tourism', 'tourism')
      .leftJoin('payment.invoices', 'invoice');

    builder.select([
      'payment.id',
      'payment.amount',
      'payment.method',
      'payment.status',
      'payment.createdAt',

      'tourism.id',
      'tourism.name',

      'user.firstName',
      'user.lastName',

      'invoice.id',
      'invoice.status',
    ]);

    // For tourism manager
    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('payment.createdAt', 'DESC');
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
   * GET /payments/1
   */
  async getPaymentById(paymentId: number, tourismId: number = null) {
    const builder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.user', 'user')
      .leftJoin('payment.tourism', 'tourism')
      .leftJoin('payment.invoices', 'invoice');

    builder.select([
      'payment.id',
      'payment.amount',
      'payment.message',
      'payment.method',
      'payment.status',
      'payment.transferFile',
      'payment.transferDescription',
      'payment.reasonRejected',
      'payment.createdAt',

      'tourism.id',
      'tourism.name',

      'user.firstName',
      'user.lastName',

      'invoice.id',
      'invoice.status',
    ]);

    // For tourism manager
    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    return await builder.where({ id: paymentId }).getOne();
  }

  /**
   * --------------------------------------------------------
   */
  async updateStatus(id: number, dto: UpadatePaymentDto) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['invoices'],
    });

    payment.status = dto.status;
    payment.reasonRejected = dto.reasonRejected;
    await payment.save();

    if (dto.status === PaymentStatus.done) {
      await this._complete(payment.invoices[0].id);
    }

    try {
      // Sending a notif to tourism
      if (payment.invoices[0].tourismId) {
        await this.notificationService.add({
          tourismId: payment.invoices[0].tourismId,
          type: NotificationTypes.payment,
          sourceId: payment.id,
          message: `پرداخت فاکتور "${
            payment.invoices[0].tourismNumber
          }" از طریق فیش بانکی ${
            dto.status === PaymentStatus.done ? 'تایید' : 'رد'
          } شد`,
        });
      }
    } catch (e) {}
  }

  /**
   * --------------------------------------------------------
   */
  private async _complete(invoiceId) {
    await this.invoiceService.updateById(invoiceId, {
      status: InvoiceStatus.done,
    });

    await this.invoiceService.setCommissionHotel(invoiceId);
    await this.invoiceService.setCommissionTour(invoiceId);
  }
}
