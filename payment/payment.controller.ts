import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigurationService } from 'src/config/configuration.service';
import { successfulResult } from 'src/utils';
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
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SavePaymentTransferDto } from './dto/save-payment-transfer.dto';
import { UpadatePaymentDto } from './dto/update-payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private config: ConfigurationService,
  ) {}

  @Post('pay')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async pay(@Body() dto: CreatePaymentDto, @User('id') userId) {
    const data = await this.paymentService.pay(dto, userId);
    return successfulResult(['در حال ارسال به درگاه بانکی'], data);
  }

  /**
   * --------------------------------------------------------
   */
  @Post('transfer')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('transferFile', multerOptions('payments')))
  async saveTransfer(
    @Body() dto: SavePaymentTransferDto,
    @User('id') userId,
    @UploadedFile() transferFile,
  ) {
    await this.paymentService.saveTransfer(dto, transferFile, userId);
    return successfulResult(['فیش بانکی با موفقیت ثبت و برای بررسی ارسال شد']);
  }

  /**
   * --------------------------------------------------------
   */
  @Get('ragaex')
  async ragaexRedirect(
    @Query('authority') authority: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const queryString = await this.paymentService.varifyRagaex(
      token,
      authority,
    );
    // http://example.com/payment?status=success&message=انجامشد
    return res.redirect(
      `${this.config.app.panelBaseUrl}/payment?${queryString}`,
    );
  }

  /**
   * -------------------------------------------------------
   * GET /payments
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده پرداخت ها، توسط نقش هایی با سطح دسترسی GET_PAYMENT <br> (مثلا ادمین یا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_PAYMENT)
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'method', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getPayments(
    @User('tourismId') tourismId,
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      ['tourism_id', 'tourismId'],
      'status',
      'method',
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.paymentService.getPayments(
      page,
      limit,
      filters,
      sorts,
      tourismId,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /payments/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده جزئیات یک پرداخت خاص، توسط نقش هایی با سطح دسترسی GET_PAYMENT <br> (مثلا ادمین یا مدیر آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_PAYMENT)
  async getPaymentById(
    @Param('id') paymentId: number,
    @User('tourismId') tourismId: number,
  ) {
    const data = await this.paymentService.getPaymentById(paymentId, tourismId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * PUT /payments/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش یک پرداخت خاص، توسط نقش هایی با سطح دسترسی UPDATE_PAYMENT <br> (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_PAYMENT)
  async updateStatus(
    @Param('id') paymentId: number,
    @Body() dto: UpadatePaymentDto,
  ) {
    await this.paymentService.updateStatus(paymentId, dto);
    return successfulResult(['وضعیت پرداختی با موفقیت به روز شد']);
  }
}
