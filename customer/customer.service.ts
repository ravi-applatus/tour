import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from 'src/utils';
import { In, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,

    private error: ErrorService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /customers
   */
  async getCustomers(page = 1, limit = 20, filters = null, sorts = null) {
    let builder = await this.customerRepository.createQueryBuilder('customer');

    builder = applyFiltersToBuilder(builder, filters);

    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('customer.createdAt', 'DESC');
    }

    const [items, totalItems] = await builder
      .take(limit) // LIMIT
      .skip((page - 1) * limit) // OFFSET
      .getManyAndCount();

    return {
      items,
      pagination: paginationResult(page, limit, totalItems),
    };
  }

  /**
   * -------------------------------------------------------
   * GET /customers/1
   */
  async getCustomerById(customerId: number) {
    return await this.customerRepository.findOne(customerId);
  }

  /**
   * -------------------------------------------------------
   * GET /passport-identity
   */
  async getCustomerByPassportOrIdentify(
    passportOrIdentityNumber: string = null,
  ) {
    if (!passportOrIdentityNumber) {
      this.error.unprocessableEntity([
        'شماره پاسپورت یا کد ملی را وارد نمایید',
      ]);
    }

    // passportOrIdentityNumber = "1234"
    // SELECT * FROM customer WHERE (passportNumber = "1234" OR identityCardNumber = "1234")
    return await this.customerRepository
      .createQueryBuilder()
      .where('(passportNumber = :pin OR identityCardNumber = :pin)', {
        pin: passportOrIdentityNumber,
      })
      .getOne();
  }

  /**
   * -------------------------------------------------------
   * POST /customers
   * add new customer
   */

  async addCustomer(
    userId: number,
    dto: CreateCustomerDto,
    passportFile: Express.Multer.File[],
    identityCardFile: Express.Multer.File[],
  ) {
    const newCustomer = new CustomerEntity();
    for (const key in dto) {
      newCustomer[key] = dto[key];
    }

    if (identityCardFile?.length > 0) {
      newCustomer.identityCardFile = `/customers/${identityCardFile[0].filename}`;
    }

    if (passportFile?.length > 0) {
      newCustomer.passportFile = `/customers/${passportFile[0].filename}`;
    }

    newCustomer.userId = userId;
    newCustomer.createdAt = new Date();

    const { identifiers } = await this.customerRepository
      .createQueryBuilder()
      .insert()
      .values(newCustomer)
      .execute();

    const newCustomerId = identifiers[0].id;
    return await this.customerRepository.findOne(newCustomerId);
  }

  /**
   * -------------------------------------------------------
   * PUT /customers/1
   */
  async updateCustomer(
    customerId: number,
    dto: UpdateCustomerDto,
    passportFile: Express.Multer.File[],
    identityCardFile: Express.Multer.File[],
  ) {
    const values = { ...dto };

    if (identityCardFile && identityCardFile.length > 0) {
      values.identityCardFile = `/customers/${identityCardFile[0].filename}`;
    }

    if (passportFile && passportFile.length > 0) {
      values.passportFile = `/customers/${passportFile[0].filename}`;
    }

    await this.customerRepository
      .createQueryBuilder()
      .update()
      .set(values)
      .where({ id: customerId })
      .execute();

    return await this.customerRepository.findOne(customerId);
  }

  /**
   * -------------------------------------------------------
   */
  async getCustomersRecordByIds(customerIds: number[]) {
    return await this.customerRepository.find({
      id: In(customerIds),
    });
  }
}
