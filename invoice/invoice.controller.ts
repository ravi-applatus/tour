import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { successfulResult } from 'src/utils';
import { Access } from 'src/utils/decorators/access.decorator';
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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceCustomerDto } from './dto/update-invoice-customer.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceService } from './invoice.service';

@ApiTags('Invoice')
@Controller('invoices')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  // @Get('fake/:id')
  // async fakePDF(@Param('id') invoiceId: number) {
  //   await this.invoiceService.fakePDF(invoiceId);
  // }

  /**
   * -------------------------------------------------------
   * POST /invoices/1/send-voucher-by-email-to-hotel
   */
  @Post(':id/send-voucher-by-email-to-hotel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.SEND_EMAIL_TO_HOTEL)
  async sendEmailToHotels(@Param('id') invoiceId: number) {
    await this.invoiceService.sendEmailToHotel(invoiceId);
    return successfulResult(['ووچر هتل باموفقیت ایمیل شد']);
  }

  /**
   * -------------------------------------------------------
   * POST /invoices
   * add new invoice
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت فاکتور جدید توسط نقش هایی با سطح دسترسی ADD_INVOICE (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_INVOICE)
  async addInvoice(
    @User('id') userId,
    @User('tourismId') tourismId,
    @Body() dto: CreateInvoiceDto,
  ) {
    const newHotel = await this.invoiceService.addInvoice(
      userId,
      tourismId,
      dto,
    );
    return successfulResult(['فاکتور جدید باموفقیت ثبت شد'], newHotel);
  }

  /**
   * -------------------------------------------------------
   * PUT /invoices/customer/1
   */
  @Put('customer/:id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات یک مسافر، توسط نقش هایی با سطح دسترسی ADD_INVOICE (مثلا کارمند آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_INVOICE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'passportFile', maxCount: 1 },
        { name: 'identityCardFile', maxCount: 1 },
      ],
      multerOptions('customers'),
    ),
  )
  async updateCustomer(
    @Param('id') invoiceCustomerId: number,
    @Body() dto: UpdateInvoiceCustomerDto,
    @UploadedFiles() files,
  ) {
    const data = await this.invoiceService.updateCustomer(
      invoiceCustomerId,
      dto,
      files.passportFile,
      files.identityCardFile,
    );

    return successfulResult(
      ['اطلاعات مسافر موردنظر با موفقیت ویرایش شد'],
      data,
    );
  }

  /**
   * -------------------------------------------------------
   * PUT /invoices/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">  تعیین وضعیت فاکتور، توسط نقش هایی با سطح دسترسی UPDATE_INVOICE <br> (مثلا ادمین ، که امکان تعیین وضعیت هتل را دارد.)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_INVOICE)
  async updateInvoice(
    @Param('id') invoiceId: number,
    @Body() dto: UpdateInvoiceDto,
  ) {
    await this.invoiceService.updateInvoice(invoiceId, dto);
    return successfulResult(['فاکتور موردنظر با موفقیت تعیین وضعیت شد']);
  }

  /**
   * --------------------------------------------------------
   * GET /invoices/statistic-passenger-reserved
   */
  @Get('statistic-passenger-reserved')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده آمار رزرو هتل ها توسط نقش هایی با سطح دسترسی GET_INVOICE_STATISTICS(مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_INVOICE_STATISTICS)
  async getCountPassengersReserved() {
    const data = await this.invoiceService.getCountPassengersReserved();
    return successfulResult([], data);
  }

  /**
   * --------------------------------------------------------
   * GET /invoices/statistic-by-status
   */
  @Get('statistic-by-status')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده آمار وضعیت فاکتورها توسط نقش هایی با سطح دسترسی GET_INVOICE_STATISTICS(مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_INVOICE_STATISTICS)
  async getStatisticByStatus() {
    const data = await this.invoiceService.getStatisticByStatus();
    return successfulResult([], data);
  }

  /**
   * --------------------------------------------------------
   * GET /invoices/statistic-income
   */
  @Get('statistic-income')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده آمار درآمد حاصله، توسط نقش هایی با سطح دسترسی GET_INVOICE_STATISTICS(مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_INVOICE_STATISTICS)
  async getIncomeStatistic() {
    const data = await this.invoiceService.getIncomeStatistic();
    return successfulResult([], data);
  }

  /**
   * --------------------------------------------------------
   * GET /invoices/statistic-checkIn-checkOut
   */
  @Get('statistic-checkIn-checkOut')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده آمار ورود و خروج هتل ها توسط نقش هایی با سطح دسترسی GET_INVOICE_STATISTICS(مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_INVOICE_STATISTICS)
  async getCountCheckInCheckOut() {
    const data = await this.invoiceService.getCountCheckInCheckOut();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /invoices
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده فاکتورها، توسط نقش هایی با سطح دسترسی GET_INVOICE <br> (مثلا ادمین یا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_INVOICE,
    PermissionsType.GET_FINANCIAL_INFO_HOTEL,
  )
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'passengers_info_status', required: false })
  @ApiQuery({ name: 'tourism_number', required: false })
  @ApiQuery({ name: 'system_number', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getInvoices(
    @User('tourismId') tourismId,
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      ['tourism_id', 'tourismId'],
      ['tourism_number', 'tourismNumber'],
      ['system_number', 'systemNumber'],
      ['passengers_info_status', 'passengersInfoStatus'],
      'status',
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
    @Access(PermissionsType.GET_FINANCIAL_INFO_HOTEL) canGetFinancialInfo,
  ) {
    const data = await this.invoiceService.getInvoices(
      page,
      limit,
      filters,
      sorts,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /invoices/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده جزئیات یک فاکتور خاص، توسط نقش هایی با سطح دسترسی GET_INVOICE <br> (مثلا ادمین یا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_INVOICE,
    PermissionsType.GET_FINANCIAL_INFO_HOTEL,
  )
  async getInvoiceById(
    @Param('id') invoiceId: number,
    @User('tourismId') tourismId: number,
    @Access(PermissionsType.GET_FINANCIAL_INFO_HOTEL) canGetFinancialInfo,
  ) {
    const data = await this.invoiceService.getInvoiceById(
      invoiceId,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * DELETE /invoices/1
   */
  @Delete(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف یک فاکتور، توسط نقش هایی با سطح دسترسی UPDATE_INVOICE (مثلا ادمین و یا کاربران آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_INVOICE)
  async deleteInvoice(
    @Param('id') invoiceId: number,
    @User('tourismId') tourismId: number,
  ) {
    await this.invoiceService.deleteInvoice(invoiceId, tourismId);
    return successfulResult(['فاکتور مورد نظر باموفقیت حذف شد']);
  }
}
