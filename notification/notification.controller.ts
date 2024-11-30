import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { NotificationService } from './notification.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { successfulResult } from '../../utils';
import { User } from '../../utils/decorators/user.decorator';
import { Page } from '../../utils/decorators/page.decorator';
import { Limit } from '../../utils/decorators/limit.decorator';
import { Sort } from '../../utils/decorators/sort.decorator';
import { Filter } from '../../utils/decorators/filter.decorator';
import { NotificationTypes } from './entities/notification.entity';

@ApiTags('Notification')
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /**
   * -------------------------------------------------------
   * GET /notifications
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'type', required: false, enum: NotificationTypes })
  @ApiQuery({ name: 'is_readed', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'message', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getAll(
    @User('tourismId') tourismId: number,
    @Page() page,
    @Limit() limit,
    @Sort() sorts,
    @Filter([
      ['is_readed', 'isReaded'],
      ['type', 'type'],
      ['message', 'message'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.notificationService.getAll(
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
   * PUT /notification/1
   */
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') notificationId: number,
    @User('tourismId') tourismId: number,
    @Body() dto: UpdateNotificationDto,
  ) {
    await this.notificationService.update(notificationId, dto, tourismId);
    return successfulResult(['نوتیفیکیشن مربوطه با موفقیت ویرایش شد']);
  }

  // /**
  //  * -------------------------------------------------------
  //  * POST /notification
  //  */
  // @Post()
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // async addNotification(@Body() dto: CreateNotificationDto) {
  //   const newNotification = await this.notificationService.addNotification(dto);
  //   return successfulResult(
  //     ['نوتیفیکیشن جدید باموفقیت ایجاد شد'],
  //     newNotification,
  //   );
  // }
}
