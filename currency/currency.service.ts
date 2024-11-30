import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import { RagaexService } from 'src/gateway/ragaex/ragaex.service';
import { Repository } from 'typeorm';
import { CurrencySources } from '../setting/entities/setting.entity';
import { SettingService } from '../setting/setting.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyEntity } from './entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,

    private error: ErrorService,
    private ragaex: RagaexService,
    private settingService: SettingService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /currencies
   */
  async getCurrency() {
    return await this.currencyRepository.find();
  }

  /**
   * -------------------------------------------------------
   * GET /currencies/active
   */
  async getActiveCurrency() {
    const dbData: any = await this.currencyRepository.find({
      where: { isActive: true },
      select: ['id', 'name', 'code', 'exchange', 'exchangeIRR'],
    });

    const { currencySource } = await this.settingService.get([
      'currencySource',
    ]);

    if (currencySource === CurrencySources.liqotrip) {
      dbData.push({
        id: 0,
        name: 'تومان',
        code: 'IRR',
        exchange: dbData.find((db) => db.code === 'USD')?.exchangeIRR || 0,
      });
    } else {
      try {
        const ragaData = await this.ragaex.exchanges();

        dbData.push({
          id: 0,
          name: 'تومان',
          code: 'IRR',
          exchange: ragaData.USD.IRR,
        });
      } catch (e) {
        // console.log('currencies', e);
      }
    }

    return dbData;
  }

  /**
   * -------------------------------------------------------
   * GET /currencies/rial-exchanges
   */
  async getRialExchanges() {
    const { currencySource } = await this.settingService.get([
      'currencySource',
    ]);

    if (currencySource === CurrencySources.liqotrip) {
      const list = await this.currencyRepository.find({
        where: { isActive: true },
        select: ['id', 'name', 'code', 'exchangeIRR'],
      });
      return list.map((item) => ({ ...item, exchange: item.exchangeIRR }));
    }

    // currencySource === 'ragaex'
    try {
      const ragaData = await this.ragaex.exchanges();

      return [
        {
          name: 'دلار',
          code: 'USD',
          exchange: ragaData?.USD?.IRR || '-',
        },
        {
          name: 'یورو',
          code: 'EUR',
          exchange: ragaData?.EUR?.IRR || '-',
        },
        {
          name: 'لیر',
          code: 'TRY',
          exchange: ragaData?.TRY?.IRR || '-',
        },
      ];
    } catch (e) {
      // console.log('currencies', e);
      this.error.internalServerError([
        'در دریافت اطلاعات از سایت راگا اکس خطایی رخ داده است',
      ]);
    }
  }

  /**
   * -------------------------------------------------------
   * GET /currencies/1
   */
  async getCurrenciesById(currencyId: number) {
    return await this.currencyRepository.findOne(currencyId);
  }

  /**
   * -------------------------------------------------------
   * POST /currencies
   * add new currency
   */

  async addCurrency(dto: CreateCurrencyDto) {
    const { identifiers } = await this.currencyRepository
      .createQueryBuilder()
      .insert()
      .values({ ...dto, lock: false })
      .execute();

    const newCurrencyId = identifiers[0].id;
    return await this.currencyRepository.findOne(newCurrencyId);
  }

  /**
   * -------------------------------------------------------
   * PUT /currencies/1
   */
  async updateCurrency(currencyId: number, dto: UpdateCurrencyDto) {
    const data = await this.currencyRepository.findOne(currencyId);

    const values: any = {};

    if (data?.lock) {
      values.exchange = dto.exchange;
      values.exchangeIRR = dto.exchangeIRR;
    } else {
      for (const key in dto) {
        values[key] = dto[key];
      }
    }

    return await this.currencyRepository
      .createQueryBuilder()
      .update()
      .set(values)
      .where({ id: currencyId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * DELETE /currencies/1
   */
  async deleteCurrencyById(currencyId: number) {
    const data = await this.currencyRepository.findOne(currencyId);

    if (data?.lock) {
      this.error.methodNotAllowed(['امکان حذف واحد ارزی سیستمی وجود ندارد']);
    }

    return await this.currencyRepository
      .createQueryBuilder()
      .delete()
      .where({ id: currencyId })
      .execute();
  }
}
