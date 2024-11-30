import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from 'src/utils';
import { Repository } from 'typeorm';
import { NotificationTypes } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { TourismService } from '../tourism/tourism.service';
import { WalletType } from '../user/entities/user-wallet-history.entity';
import { UserService } from '../user/user.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { WithdrawEntity, WithdrawStatus } from './entities/withdraw.entity';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(WithdrawEntity)
    private withdrawRepository: Repository<WithdrawEntity>,

    private error: ErrorService,
    private userService: UserService,
    private tourismService: TourismService,
    private notificationService: NotificationService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /withdraws
   */
  async withdrawList(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    tourismId = null,
  ) {
    let builder = this.withdrawRepository.createQueryBuilder('withdraw');

    builder.leftJoin('withdraw.user', 'user');
    builder.leftJoin('withdraw.tourism', 'tourism');

    builder.select([
      'withdraw.id',
      'withdraw.amount',
      'withdraw.status',
      'withdraw.rialRequest',
      'withdraw.reasonRejected',
      'withdraw.createdAt',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.ibanRial',
      'user.ibanDollar',

      'tourism.id',
      'tourism.name',
    ]);

    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('withdraw.createdAt', 'DESC');
    }
    builder = applyFiltersToBuilder(builder, filters);

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
   * GET /withdraws/1
   */

  async getWithdrawById(withdrawId: number, tourismId: number = null) {
    const builder = this.withdrawRepository.createQueryBuilder('withdraw');
    builder.leftJoin('withdraw.user', 'user');
    builder.leftJoin('withdraw.tourism', 'tourism');
    builder.select([
      'withdraw.id',
      'withdraw.amount',
      'withdraw.rialRequest',
      'withdraw.status',
      'withdraw.reasonRejected',
      'withdraw.createdAt',

      'user.id',
      'user.firstName',
      'user.lastName',
      'user.mobile',
      'user.ibanRial',
      'user.ibanDollar',

      'tourism.id',
      'tourism.name',
    ]);

    if (tourismId) {
      builder.andWhere({ tourismId });
    }
    const data = await builder.andWhere({ id: withdrawId }).getOne();

    if (!data) {
      this.error.unprocessableEntity(['درخواست موردنظر وجود ندارد']);
    }

    return data;
  }

  /**
   * -------------------------------------------------------
   * POST /withdraws
   */
  async addWithdraw(
    dto: CreateWithdrawDto,
    userId: number,
    tourismId: number,
    wallet: number,
  ) {
    if (!wallet) {
      this.error.unprocessableEntity(['موجودی کیف پول شما کافی نمی باشد']);
    }
    if (dto.amount > wallet) {
      this.error.unprocessableEntity(['موجودی کیف پول شما کافی نمی باشد']);
    }

    //create new withdraw
    const { identifiers } = await this.withdrawRepository
      .createQueryBuilder()
      .insert()
      .values({
        amount: dto.amount,
        rialRequest: dto.rialRequest,
        userId,
        tourismId,
        status: WithdrawStatus.pending,
        createdAt: new Date(),
      })
      .execute();

    //update wallet user
    await this.userService.updateUser(userId, {
      ibanDollar: dto.ibanDollar,
      ibanRial: dto.ibanRial,
      wallet: wallet - dto.amount,
    });

    const newWithdrawId = identifiers[0].id;

    // Sending a notif to admin
    const tourism = await this.tourismService.getRecordByTourismId(tourismId);
    await this.notificationService.add({
      type: NotificationTypes.withdraw,
      sourceId: newWithdrawId,
      message: `درخواست برداشت وجه به مبلغ $${dto.amount} توسط آژانس ${tourism.name} ثبت شد`,
    });

    return await this.withdrawRepository.findOne(newWithdrawId);
  }

  /**
   * -------------------------------------------------------
   * PUT /withdraws/1
   * by admin
   */
  async updateWithdraw(withdrawId: number, dto: UpdateWithdrawDto) {
    const withdraw = await this.withdrawRepository.findOne(withdrawId);

    if (withdraw?.status !== WithdrawStatus.pending) {
      this.error.unprocessableEntity([
        'این درخواست وجه قبلا تعیین وضعیت شده است!',
      ]);
    }

    if (dto.status === WithdrawStatus.rejected) {
      // rolback wallet by userId(tourleaderId) and amount
      await this.userService.updateWallet(withdraw.userId, withdraw.amount);
    } else if (dto.status === 'done') {
      // add wallet history record
      await this.userService.addWalletHistory(
        withdraw.userId,
        withdraw.tourismId,
        null,
        withdraw.amount,
        WalletType.withdraw,
      );
    }

    return await this.withdrawRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: withdrawId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * PUT /withdraws/1/cancel
   * by tourism manager
   */
  async cancelTourismWithdraw(withdrawId: number, tourismId: number) {
    const withdraw = await this.withdrawRepository.findOne(withdrawId);

    const { affected } = await this.withdrawRepository
      .createQueryBuilder()
      .update()
      .set({
        status: WithdrawStatus.rejected,
        reasonRejected: 'درخواست برداشت وجه توسط آژانس لغو شد',
      })
      .where({ id: withdrawId, status: WithdrawStatus.pending, tourismId })
      .execute();

    if (affected === 0) {
      this.error.unprocessableEntity([
        'امکان لغو درخواست های تایید یا رد شده وجود ندارد.',
      ]);
    }

    // rolback wallet by userId(tourleaderId) and amount
    await this.userService.updateWallet(withdraw.userId, withdraw.amount);

    return true;
  }
}
