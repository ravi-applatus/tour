import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import { Repository } from 'typeorm';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from '../../utils';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,

    private error: ErrorService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /currencies
   */
  async getAll(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    tourismId = null,
  ) {
    let builder =
      this.notificationRepository.createQueryBuilder('notification');

    builder = applyFiltersToBuilder(builder, filters);

    if (tourismId) {
      builder.andWhere({ tourismId });
    } else {
      builder.andWhere('notification.tourismId IS NULL');
    }

    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('notification.createdAt', 'DESC');
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
   * PUT /currencies/1
   */
  async update(id: number, dto: UpdateNotificationDto, tourismId = null) {
    const builder = this.notificationRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id });

    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    return await builder.execute();
  }

  /**
   * -------------------------------------------------------
   * add new notification
   */
  async add(data) {
    const { identifiers } = await this.notificationRepository
      .createQueryBuilder()
      .insert()
      .values({ ...data, isReaded: false, createdAt: new Date() })
      .execute();

    const newNotificationId = identifiers[0].id;
    return newNotificationId;
  }
}
