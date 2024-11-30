import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'jalali-moment';
import { ErrorService } from 'src/error/error.service';
import { MailService } from 'src/mail/mail.service';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
  randomHash,
} from 'src/utils';
import { Repository } from 'typeorm';
import { RoleIds } from '../role/entities/role.entity';
import { TourismService } from '../tourism/tourism.service';
import { CreateTourismEmployeeDto } from './dto/create-tourism-employee.dto';
import { CreateTourismManagerDto } from './dto/create-tourism-manager.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateTourismEmployeeDto } from './dto/update-tourism-employee.dto';
import { UpdateUserTourismDto } from './dto/update-user-tourism.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserWalletHistoryEntity,
  WalletType,
} from './entities/user-wallet-history.entity';
import { UserEntity, UserStatus } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(UserWalletHistoryEntity)
    private userWalletHistoryRepository: Repository<UserWalletHistoryEntity>,

    private error: ErrorService,
    private mail: MailService,

    @Inject(forwardRef(() => TourismService))
    private tourismService: TourismService,
  ) {}

  /**
   * -------------------------------------------------------
   */
  async addWalletHistory(
    adminId: number,
    tourismId: number,
    invoiceId: number,
    amount: number,
    type: WalletType,
  ) {
    const { identifiers } = await this.userWalletHistoryRepository
      .createQueryBuilder()
      .insert()
      .values({
        userId: adminId,
        tourismId,
        invoiceId,
        amount,
        type,
        createdAt: new Date(),
      })
      .execute();

    const newRecord = identifiers[0].id;
    return newRecord;
  }

  /**
   * -------------------------------------------------------
   */
  async updateWallet(userId, amount) {
    const { wallet } = await this.userRepository.findOne(userId);
    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ wallet: wallet + amount })
      .where({ id: userId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * POST /users
   * add new user by who user have ADD_USER permission
   */
  async addUser(dto: CreateUserDto) {
    if (
      ![RoleIds.TOURISM_MANAGER, RoleIds.TOURISM_EMPLOYEE].includes(+dto.roleId)
    ) {
      delete dto.tourismId;
    }

    const newUser = new UserEntity();
    for (const key in dto) {
      newUser[key] = dto[key];
    }

    newUser.createdAt = new Date();
    newUser.wallet = 0;

    const { identifiers } = await this.userRepository
      .createQueryBuilder()
      .insert()
      .values(newUser)
      .execute();

    const newUserId = identifiers[0].id;
    return await this._addResponse(newUserId);
  }

  /**
   * -------------------------------------------------------
   * POST /user/tourism-manager
   * add new user by user who have ADD_TOURISM_MANAGER permission
   */
  async addTourismManager(
    dto: CreateTourismManagerDto,
    identityCardFile: Express.Multer.File,
  ) {
    const newUser = new UserEntity();
    for (const key in dto) {
      newUser[key] = dto[key];
    }

    newUser.identityCardFile = `/tourisms/${identityCardFile.filename}`;
    newUser.status = UserStatus.inactive;
    newUser.roleId = RoleIds.TOURISM_MANAGER;
    newUser.createdAt = new Date();
    newUser.wallet = 0;

    const { identifiers } = await this.userRepository
      .createQueryBuilder()
      .insert()
      .values(newUser)
      .execute();

    const newAdminUserId = identifiers[0].id;

    await this.tourismService.updateTourismWithAdminById(
      dto.tourismId,
      newAdminUserId,
    );

    return await this._addResponse(newAdminUserId);
  }

  /**
   * -------------------------------------------------------
   * POST /users
   * add new user by user who have ADD_TOURISM_EMPLOYEE permission
   */
  async addTourismEmployee(dto: CreateTourismEmployeeDto, tourismId) {
    const newUser = new UserEntity();
    for (const key in dto) {
      newUser[key] = dto[key];
    }

    newUser.roleId = RoleIds.TOURISM_EMPLOYEE;
    newUser.status = UserStatus.active;
    newUser.tourismId = tourismId;
    newUser.createdAt = new Date();
    newUser.wallet = 0;

    const { identifiers } = await this.userRepository
      .createQueryBuilder()
      .insert()
      .values(newUser)
      .execute();

    const newUserId = identifiers[0].id;

    return await this._addResponse(newUserId);
  }

  /**
   * -------------------------------------------------------
   * GET user info
   */
  async getById(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .leftJoin('role.roleMapPermissions', 'roleMapPermissions')
      .leftJoin('roleMapPermissions.permission', 'permission')
      .leftJoin('user.tourism', 'tourism')
      .leftJoin('tourism.level', 'level')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.mobile',
        'user.roleId',
        'user.tourismId',
        'user.status',
        'user.ibanDollar',
        'user.ibanRial',
        'user.identityCardFile',
        'user.identityCardNumber',
        'user.wallet',
        'user.createdAt',

        'tourism.id',
        'tourism.name',

        'level.id',
        'level.name',

        'role.id',
        'role.name',

        'roleMapPermissions.id',

        'permission.id',
        'permission.type',
      ])
      .where({ id })
      .getOne();

    return user;
  }

  /**
   * -------------------------------------------------------
   * GET /users
   */
  async getUsers(page = 1, limit = 20, filters = null, sorts = null) {
    let builder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .leftJoin('user.tourism', 'tourism');

    builder.select([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.mobile',
      'user.identityCardNumber',
      'user.status',
      'user.createdAt',

      'role.id',
      'role.name',

      'tourism.id',
      'tourism.name',
    ]);

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('user.createdAt', 'DESC');
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
   * GET /users/tourism/by-marketer
   */
  async getUserTourism(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    marketerId = null,
    adminId = null,
  ) {
    let builder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role');

    if (marketerId) {
      builder.innerJoin(
        'user.tourism',
        'tourism',
        'tourism.marketerId = :marketerId',
        {
          marketerId,
        },
      );
    } else if (adminId) {
      builder.innerJoin(
        'user.tourism',
        'tourism',
        'tourism.adminId = :adminId',
        {
          adminId,
        },
      );
      builder.andWhere('user.id != :adminId', { adminId });
    }

    builder.select([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.mobile',
      'user.identityCardNumber',
      'user.status',
      'user.createdAt',

      'role.id',
      'role.name',

      'tourism.id',
      'tourism.name',
    ]);

    builder = applyFiltersToBuilder(builder, filters);
    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('user.createdAt', 'DESC');
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
   * PUT /users
   */
  async updateUser(
    userId: number,
    dto: UpdateUserDto | any,
    identityCardFile: Express.Multer.File = null,
  ) {
    const user = await this.userRepository.findOne(userId);

    // It should not be changed, if the password is empty
    if (!dto.password) {
      delete dto.password;
    }

    if (identityCardFile) {
      dto.identityCardFile = `/tourisms/${identityCardFile.filename}`;
    }

    delete dto.id;
    Object.keys(dto).forEach((field) => {
      user[field] = dto[field];
    });

    await user.save();
  }

  /**
   * -------------------------------------------------------
   * PUT /users/tourism/by-marketer
   */
  async updateUserTourismByMarketer(
    dto: UpdateUserTourismDto,
    marketerId: number,
    identityCardFile: Express.Multer.File,
  ) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(
        'user.tourism',
        'tourism',
        'tourism.marketerId = :marketerId',
        {
          marketerId,
        },
      )
      .andWhere({ id: dto.id })
      .getOne();

    if (!user) {
      this.error.methodNotAllowed([
        'اجازه ویرایش اطلاعات مدیر/کارمند این آژانس را ندارید',
      ]);
    }

    if (identityCardFile) {
      dto.identityCardFile = `/tourisms/${identityCardFile.filename}`;
    }

    return await this.userRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: dto.id })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * PUT /users/tourism-employee/by-tourism-manager
   */
  async updateTourismEmployee(dto: UpdateTourismEmployeeDto, adminId: number) {
    const user = await this.userRepository.findOne({
      where: { id: dto.id },
      relations: ['tourism'],
    });

    if (user.tourism?.adminId !== adminId) {
      this.error.methodNotAllowed([
        'اجازه ویرایش اطلاعات کارمند مورد نظر برای شما وجود ندارد',
      ]);
    }

    if (!dto.password) {
      // It should not be changed, if the password is empty
      delete dto.password;
    }

    Object.keys(dto).forEach((field) => {
      user[field] = dto[field];
    });

    await user.save();
  }

  /**
   * -------------------------------------------------------
   * GET /users/1
   */

  async getUserById(userId: number) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .leftJoin('user.tourism', 'tourism')
      .leftJoin('tourism.level', 'level')
      .leftJoin('tourism.marketer', 'marketer')
      .leftJoin('tourism.admin', 'admin')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.mobile',
        'user.identityCardNumber',
        'user.identityCardFile',
        'user.ibanDollar',
        'user.ibanRial',
        'user.status',
        'user.wallet',
        'user.createdAt',

        'role.id',
        'role.name',

        'tourism.id',
        'tourism.name',
        'tourism.address',
        'tourism.licenseFile',
        'tourism.status',

        'level.id',
        'level.name',

        'admin.id',
        'admin.firstName',
        'admin.lastName',

        'marketer.id',
        'marketer.firstName',
        'marketer.lastName',
      ])
      .where({ id: userId })
      .getOne();
  }

  /**
   * -------------------------------------------------------
   * GET /users/tourism/by-marketer/1
   */
  async getUserTourismById(marketerId: number, userId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .innerJoin(
        'user.tourism',
        'tourism',
        'tourism.marketerId = :marketerId',
        {
          marketerId,
        },
      )
      .leftJoin('tourism.level', 'level')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.mobile',
        'user.identityCardNumber',
        'user.identityCardFile',
        'user.status',
        'user.createdAt',

        'role.id',
        'role.name',

        'tourism.id',
        'tourism.name',
        'tourism.address',
        'tourism.licenseFile',
        'tourism.status',

        'level.id',
        'level.name',
      ])
      .where({ id: userId })
      .getOne();

    if (!user) {
      this.error.methodNotAllowed([
        'اجازه نمایش اطلاعات این کاربر برای شما مقدور نمی باشد',
      ]);
    }

    return user;
  }

  /**
   * -------------------------------------------------------
   * GET /users/tourism-employee/by-tourism-manager/1
   */
  async getEmployeeById(userId: number, tourismId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.tourismId',
        'user.email',
        'user.mobile',
        'user.identityCardNumber',
        'user.identityCardFile',
        'user.status',
        'user.createdAt',

        'role.id',
        'role.name',
      ])
      .where({ id: userId })
      .andWhere({ tourismId })
      .getOne();

    if (!user) {
      this.error.methodNotAllowed([
        'اجازه نمایش اطلاعات این کاربر برای شما مقدور نمی باشد',
      ]);
    }

    return user;
  }

  /**
   * -------------------------------------------------------
   * GET /wallets-history
   */
  async getWalletsHistory(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    tourismId = null,
  ) {
    let builder =
      this.userWalletHistoryRepository.createQueryBuilder('walletHistory');

    builder.leftJoin('walletHistory.user', 'user');
    builder.leftJoin('walletHistory.tourism', 'tourism');
    builder.leftJoin('walletHistory.invoice', 'invoice');

    builder.select([
      'walletHistory.id',
      'walletHistory.amount',
      'walletHistory.type',
      'walletHistory.createdAt',

      'user.id',
      'user.firstName',
      'user.lastName',

      'tourism.id',
      'tourism.name',

      'invoice.id',
      'invoice.amount',
    ]);

    if (tourismId) {
      builder.andWhere({ tourismId });
    }

    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('walletHistory.createdAt', 'DESC');
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
   * GET /users/1/wallets
   */
  async getWalletUsers(userId: number) {
    return await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.wallet', 'user.ibanDollar', 'user.ibanRial'])
      .where({ id: userId })
      .getOne();
  }
  /**
   * -------------------------------------------------------
   */
  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne(id);

    if (oldPassword && !(await user.isCorrectSaltPassword(oldPassword))) {
      this.error.unprocessableEntity(['کلمه عبور فعلی اشتباه است']);
    }

    user.password = newPassword;
    await user.save();

    return user;
  }

  /**
   * -------------------------------------------------------
   */
  async forgotPasswordByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });

    user.randomHash = randomHash();
    user.expireRandomHash = moment().add(60, 'minutes').toDate();
    await user.save();

    await this.mail.sendForgotPassword({
      to: user.email,
      data: {
        hash: user.randomHash,
        firstName: user.lastName,
        lastName: user.firstName,
      },
    });

    return user;
  }

  /**
   * -------------------------------------------------------
   */
  async resetPasswordByToken(token: string, newPassword: string) {
    const user = await this._findByValidHashCode(token);

    if (!user) {
      throw this.error.unprocessableEntity([
        'لینک درخواست فراموشی کلمه عبور، نامعتبر یا منقضی شده است',
      ]);
    }

    user.randomHash = null;
    user.expireRandomHash = null;
    user.password = newPassword;
    await user.save();

    return user;
  }

  /**
   * -------------------------------------------------------
   */
  private async _findByValidHashCode(randomHash: string) {
    const user = await this.userRepository.findOne({ randomHash });
    if (user && moment(user.expireRandomHash).isAfter(moment())) {
      return user;
    }
    return false;
  }

  /**
   * -------------------------------------------------------
   */
  async findActiveById(userId: number) {
    return await this.userRepository.findOne({
      where: { id: userId, status: UserStatus.active },
      relations: [
        'role',
        'role.roleMapPermissions',
        'role.roleMapPermissions.permission',
      ],
    });
  }

  /**
   * -------------------------------------------------------
   */
  async getByEmailOrMobile(emailOrMobile: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .andWhere('(user.email = :eom OR user.mobile = :eom)', {
        eom: emailOrMobile,
      })
      // .andWhere({ status: UserStatus.active })
      .getOne();
  }

  /**
   * -------------------------------------------------------
   */
  async _addResponse(newUserId: number) {
    const data = await this.userRepository.findOne(newUserId);

    delete data.password;
    delete data.previousPassword;
    delete data.randomHash;
    delete data.expireRandomHash;

    return data;
  }

  /**
   * -------------------------------------------------------
   */
  async findRecordById(userId) {
    return await this.userRepository.findOne(userId);
  }
}
