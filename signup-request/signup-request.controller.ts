import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { successfulResult } from '../../utils';
import { Filter } from '../../utils/decorators/filter.decorator';
import { Limit } from '../../utils/decorators/limit.decorator';
import { Page } from '../../utils/decorators/page.decorator';
import { Sort } from '../../utils/decorators/sort.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CreateSignupRequestDto } from './dto/create-signup-request.dto';
import { UpdateSignupRequestDto } from './dto/update-signup_request.dto';
import { SignupRequestService } from './signup-request.service';

@ApiTags('Signup Request')
@Controller('signup-requests')
export class SignupRequestController {
  constructor(private signupRequestService: SignupRequestService) {}

  /**
   * -------------------------------------------------------
   * POST /signup-requests
   */
  @Post()
  async addSignupRequest(@Body() dto: CreateSignupRequestDto) {
    await this.signupRequestService.addSignupRequest(dto);
    return successfulResult([
      'درخواست ثبت نام شما باموفقیت ارسال شد، لطفا منتظر بررسی کارشناسان باشید',
    ]);
  }

  /**
   * -------------------------------------------------------
   * GET /signup-requests
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_SIGNUP_REQUEST)
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'address', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'tourism_name', required: false })
  @ApiQuery({ name: 'admin_name', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getSignupRequest(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      'phone',
      'email',
      'address',
      'status',
      ['tourism_name', 'tourismName'],
      ['admin_name', 'adminName'],
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.signupRequestService.getSignupRequest(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /signup-requests/1
   */
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_SIGNUP_REQUEST)
  async getSignupRequestById(@Param('id') requestId: number) {
    const data = await this.signupRequestService.getSignupRequestById(
      requestId,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * PUT /signup-requests/1
   */
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_SIGNUP_REQUEST)
  async updateSignupRequest(
    @Param('id') requestId: number,
    @Body() dto: UpdateSignupRequestDto,
  ) {
    await this.signupRequestService.updateSignupRequest(requestId, dto);
    return successfulResult([
      'درخواست ثبت نام موردنظر با موفقیت تعیین وضعیت شد',
    ]);
  }
}
