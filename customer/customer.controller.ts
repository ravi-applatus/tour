import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { Filter } from 'src/utils/decorators/filter.decorator';
import { Limit } from 'src/utils/decorators/limit.decorator';
import { Page } from 'src/utils/decorators/page.decorator';
import { Sort } from 'src/utils/decorators/sort.decorator';
import { User } from 'src/utils/decorators/user.decorator';
import { multerOptions } from 'src/utils/multer.options';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Permissions } from '../auth/permission/permissions.decorator';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customer')
@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  /**
   * -------------------------------------------------------
   * GET /passport-identity
   */
  @Get('/passport-identity')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک مشتری، بااستفاده از شماره ملی یا پاسپورت، <br> توسط نقش هایی با سطح دسترسی GET_CUSTOMER_PASSPORT_IDENTIFY (مثلا آژانس)</p>',
  })
  @ApiQuery({ name: 'number', required: true })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_CUSTOMER_PASSPORT_IDENTIFY)
  async getCustomerByPassportOrIdentify(
    @Query('number') passportOrIdentityNumber: string,
  ) {
    const data = await this.customerService.getCustomerByPassportOrIdentify(
      passportOrIdentityNumber,
    );

    return {
      success: !!data,
      messages: [],
      data: data || null,
    };
  }

  /**
   * -------------------------------------------------------
   * GET /customers/1
   */
  @Get(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات یک مشتری، توسط نقش هایی با سطح دسترسی GET_CUSTOMER (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_CUSTOMER)
  async getCustomerById(@Param('id') customerId: number) {
    const data = await this.customerService.getCustomerById(customerId);
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /customers
   */
  @Get()
  @ApiOperation({
    description:
      '<p dir="rtl">مشاهده اطلاعات مشتریان، توسط نقش هایی با سطح دسترسی GET_CUSTOMER (مثلا ادمین)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.GET_CUSTOMER)
  @ApiQuery({ name: 'tourism_id', required: false })
  @ApiQuery({ name: 'first_name', required: false })
  @ApiQuery({ name: 'last_name', required: false })
  @ApiQuery({ name: 'mobile', required: false })
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'e.g. gte:2022-04-16[and]lte:2022-04-16',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Default: 20' })
  @ApiQuery({ name: 'page', required: false, description: 'Default: 1' })
  @ApiQuery({ name: 'sort', required: false, description: 'e.g. id:desc' })
  async getCustomers(
    @Page() page,
    @Limit(50) limit,
    @Sort() sorts,
    @Filter([
      ['tourism_id', 'tourismId'],
      ['first_name', 'firstName'],
      ['last_name', 'lastName'],
      'mobile',
      'phone',
      'email',
      'gender',
      ['date', 'createdAt', 'DATE'],
    ])
    filters,
  ) {
    const data = await this.customerService.getCustomers(
      page,
      limit,
      filters,
      sorts,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * POST /customers
   * add new customer
   */
  @Post()
  @ApiOperation({
    description:
      '<p dir="rtl">ثبت یک مشتری جدید، توسط نقش هایی با سطح دسترسی ADD_CUSTOMER (مثلا کارمند آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_CUSTOMER)
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
  async addCustomer(
    @User('id') userId,
    @Body() dto: CreateCustomerDto,
    @UploadedFiles() files,
  ) {
    const newCustomer = await this.customerService.addCustomer(
      userId,
      dto,
      files.passportFile,
      files.identityCardFile,
    );
    return successfulResult(['مشتری جدید باموفقیت اضافه شد'], newCustomer);
  }

  /**
   * -------------------------------------------------------
   * PUT /customers/1
   */
  @Put(':id')
  @ApiOperation({
    description:
      '<p dir="rtl">ویرایش اطلاعات یک مشتری، توسط نقش هایی با سطح دسترسی UPDATE_CUSTOMER (مثلا کارمند آژانس)</p>',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_CUSTOMER)
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
    @Param('id') customerId: number,
    @Body() dto: UpdateCustomerDto,
    @UploadedFiles() files,
  ) {
    const data = await this.customerService.updateCustomer(
      customerId,
      dto,
      files.passportFile,
      files.identityCardFile,
    );
    return successfulResult(
      ['اطلاعات مشتری موردنظر با موفقیت ویرایش شد'],
      data,
    );
  }
}
