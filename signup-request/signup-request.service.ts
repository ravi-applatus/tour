import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigurationService } from '../../config/configuration.service';
import { ErrorService } from '../../error/error.service';
import { MailService } from '../../mail/mail.service';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from '../../utils';
import { NotificationTypes } from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { CreateSignupRequestDto } from './dto/create-signup-request.dto';
import { UpdateSignupRequestDto } from './dto/update-signup_request.dto';
import {
  SignupRequestEntity,
  SignupRequestStatus,
} from './entities/signup-request.entity';

@Injectable()
export class SignupRequestService {
  constructor(
    @InjectRepository(SignupRequestEntity)
    private signupRequestRepository: Repository<SignupRequestEntity>,

    private error: ErrorService,
    private mail: MailService,
    private config: ConfigurationService,
    private notificationService: NotificationService,
  ) {}

  /**
   * -------------------------------------------------------
   * POST /signup-requests
   */
  async addSignupRequest(dto: CreateSignupRequestDto) {
    const { identifiers } = await this.signupRequestRepository
      .createQueryBuilder()
      .insert()
      .values({
        ...dto,
        status: SignupRequestStatus.pending,
        createdAt: new Date(),
      })
      .execute();

    // send email to admin system
    try {
      await this.mail.notifyNewSignupRequestToAdmin({
        to: this.config.mail.defaultEmail,
        data: null,
      });
    } catch (e) {
      console.log('ERROR, SEND EMAIL TO ADMIN LIQOTRIP', e);
    }

    const newSignupRequestId = identifiers[0].id;

    await this.notificationService.add({
      type: NotificationTypes.signupRequest,
      sourceId: newSignupRequestId,
      message: `درخواست ثبت نام جدید توسط آژانس ${dto.tourismName} ثبت شد`,
    });

    return true;
  }

  /**
   * -------------------------------------------------------
   * GET /signup-requests
   */
  async getSignupRequest(page = 1, limit = 20, filters = null, sorts = null) {
    let builder = this.signupRequestRepository.createQueryBuilder('request');

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('request.id', 'DESC');
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
   * GET /signup-requests/1
   */
  async getSignupRequestById(requestId: number) {
    const builder = this.signupRequestRepository.createQueryBuilder('request');

    return await builder.where({ id: requestId }).getOne();
  }

  /**
   * -------------------------------------------------------
   * PUT /signup-requests/1
   */
  async updateSignupRequest(requestId: number, dto: UpdateSignupRequestDto) {
    return await this.signupRequestRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: requestId })
      .execute();
  }
}
