import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { successfulResult } from 'src/utils';
import { Filter } from 'src/utils/decorators/filter.decorator';
import { Limit } from 'src/utils/decorators/limit.decorator';
import { Page } from 'src/utils/decorators/page.decorator';
import { Sort } from 'src/utils/decorators/sort.decorator';
import { User } from 'src/utils/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { WithdrawStatus } from './entities/withdraw.entity';
import { WithdrawService } from './withdraw.service';

@ApiTags('Withdraw')
@Controller('withdraws')
export class WithdrawController {
  constructor(private withdrawService: WithdrawService) {}

  /**
   * -------------------------------------------------------
   * GET /withdraws
   * Permission -> admin and tourism
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده درخواست های برداشت وجه، توسط نقش هایی با سطح دسترسی GET_WITHDRAW (مثلا ادمین یا آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_WITHDRAW)
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'e.g. done',
    enum: WithdrawStatus,
  })
  @ApiQuery({ name: 'user_id', required: false, description: 'e.g. 1' })
  @ApiQuery({ name: 'tourism_id', required: false, description: 'e.g. 1' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'e.g. gte:2022-04-16[and]lte:2022-04-16',
  })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  async withdrawList(
    @User('tourismId') tourismId,
    @Page()
    page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'status',
      ['date', 'createdAt', 'DATE'],
      ['user_id', 'userId'],
      ['tourism_id', 'tourismId'],
    ])
    filters,
  ) {
    const list = await this.withdrawService.withdrawList(
      page,
      limit,
      filters,
      sorts,
      tourismId,
    );
    return successfulResult([], list);
  }

  /**
   * -------------------------------------------------------
   * POST /withdraws
   * Permission -> tourism (manager / employee)
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ایجاد درخواست جدید توسط نقش هایی که سطح دسترسی ADD_WITHDRAW <br> را دارند. (مثلا آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_WITHDRAW)
  async addWithdraw(
    @Body() dto: CreateWithdrawDto,
    @User('id') userId: number,
    @User('tourismId') tourismId: number,
    @User('wallet') wallet: number,
  ) {
    const newWithdraw = await this.withdrawService.addWithdraw(
      dto,
      userId,
      tourismId,
      wallet,
    );
    return successfulResult(['درخواست جدید باموفقیت ایجاد شد'], newWithdraw);
  }

  /**
   * -------------------------------------------------------
   * GET /withdraws/1
   * Permission -> admin and tourism
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک درخواست برداشت وجه خاص، توسط نقش هایی با سطح دسترسی GET_WITHDRAW (مثلا ادمین یا آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_WITHDRAW)
  async getWithdrawById(
    @Param('id') withdrawId: number,
    @User('tourismId') tourismId,
  ) {
    const data = await this.withdrawService.getWithdrawById(
      withdrawId,
      tourismId,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * PUT /withdraws/1
   * Permission -> admin
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">تعیین وضعیت یک درخواست، توسط نقش هایی با سطح دسترسی UPDATE_STATUS_WITHDRAW (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_STATUS_WITHDRAW)
  async updateWithdraw(
    @Param('id') withdrawId: number,
    @Body() dto: UpdateWithdrawDto,
  ) {
    await this.withdrawService.updateWithdraw(withdrawId, dto);
    return successfulResult(['درخواست موردنظر با موفقیت تعیین وضعیت شد']);
  }

  /**
   * -------------------------------------------------------
   * PUT /withdraws/1/cancel
   * Permission -> tourism manager
   */
  @Put(':id/cancel')
  @ApiOperation({
    description:
      '<p dir="rtl"> لغو یک درخواست، توسط نقش هایی با سطح دسترسی CANCEL_TOURISM_WITHDRAW (مثلا آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.CANCEL_TOURISM_WITHDRAW)
  async cancelTourismWithdraw(
    @Param('id') withdrawId: number,
    @User('tourismId') tourismId: number,
  ) {
    await this.withdrawService.cancelTourismWithdraw(withdrawId, tourismId);
    return successfulResult(['درخواست موردنظر، لغو شد']);
  }
}
