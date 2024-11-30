import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { successfulResult } from 'src/utils';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@ApiTags('Currency')
@Controller('currencies')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  /**
   * -------------------------------------------------------
   * GET /currencies
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده واحدهای ارزی توسط نقش هایی با سطح دسترسی GET_CURRENCY (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_CURRENCY)
  async getCurrency() {
    const data = await this.currencyService.getCurrency();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /currencies/active
   */
  @Get('active')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده واحدهای ارزی فعال، توسط نقش هایی با سطح دسترسی GET_ACTIVE_CURRENCY (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_ACTIVE_CURRENCY)
  async getActiveCurrency() {
    const data = await this.currencyService.getActiveCurrency();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /currencies/rial-exchanges
   */
  @Get('rial-exchanges')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده واحدهای ارزی فعال، توسط نقش هایی با سطح دسترسی GET_ACTIVE_CURRENCY (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_ACTIVE_CURRENCY)
  async getRagaExchanges() {
    const data = await this.currencyService.getRialExchanges();
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /currencies/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده یک واحد ارزی خاص، توسط نقش هایی با سطح دسترسی GET_CURRENCY (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_CURRENCY)
  async getCurrenciesById(@Param('id') currencyId: number) {
    const data = await this.currencyService.getCurrenciesById(currencyId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * POST /currency
   * add new currency
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت واحد ارزی جدید توسط نقش هایی با سطح دسترسی ADD_CURRENCY (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_CURRENCY)
  async addCurrency(@Body() dto: CreateCurrencyDto) {
    const newCurrency = await this.currencyService.addCurrency(dto);
    return successfulResult(['واحد ارزی جدید باموفقیت ایجاد شد'], newCurrency);
  }

  /**
   * -------------------------------------------------------
   * PUT /currency/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش یک واحد ارزی خاص، توسط نقش هایی با سطح دسترسی UPDATE_CURRENCY (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_CURRENCY)
  async updateCurrency(
    @Param('id') currencyId: number,
    @Body() dto: UpdateCurrencyDto,
  ) {
    await this.currencyService.updateCurrency(currencyId, dto);
    return successfulResult(['واحد ارزی مربوطه با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * DELETE /currencies/1
   */
  @Delete(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">حذف یک واحد ارزی خاص، توسط نقش هایی با سطح دسترسی DELETE_CURRENCY (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.DELETE_CURRENCY)
  async deleteCurrencyById(@Param('id') currencyId: number) {
    await this.currencyService.deleteCurrencyById(currencyId);
    return successfulResult(['واحد ارزی موردنظر باموفقیت حذف شد']);
  }
}
