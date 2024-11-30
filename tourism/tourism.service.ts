import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorService } from 'src/error/error.service';
import {
  applyFiltersToBuilder,
  applySortingToBuilder,
  paginationResult,
} from 'src/utils';
import { Repository } from 'typeorm';
import { WalletType } from '../user/entities/user-wallet-history.entity';
import { UserService } from '../user/user.service';
import { CreateTourismLevelDto } from './dto/create-tourism-level.dto';
import { CreateTourismDto } from './dto/create-tourism.dto';
import { UpdateTourismByMarketerDto } from './dto/update-tourism-by-marketer.dto';
import { UpdateTourismLevelDto } from './dto/update-tourism-level.dto';
import { UpdateTourismDto } from './dto/update-tourism.dto';
import { UpdateWalletTourismDto } from './dto/update-wallet-tourism';
import {
  TourismLevelEntity,
  TourismLevelIds,
} from './entities/tourism-level.entity';
import { TourismEntity, TourismStatus } from './entities/tourism.entity';

@Injectable()
export class TourismService {
  constructor(
    @InjectRepository(TourismEntity)
    private tourismRepository: Repository<TourismEntity>,
    @InjectRepository(TourismLevelEntity)
    private tourismLevelRepository: Repository<TourismLevelEntity>,

    private error: ErrorService,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /tourisms/level/1/by-admin
   */
  async getTourismLevelById(tourismLevelId: number) {
    return await this.tourismLevelRepository.findOne(tourismLevelId);
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms/level/by-admin
   * GET /tourisms/level
   */
  async getTourismsLevel(fullAccess = false) {
    const select = ['id', 'name'] as any;
    if (fullAccess) {
      select.push('hotelCommissionPerPerson', 'tourCommissionPerPerson');
    }

    return await this.tourismLevelRepository.find({ select });
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms/1
   * GET /tourisms/by-marketer/1
   */
  async getTourismById(tourismId: number, marketerId: number = null) {
    const builder = await this.tourismRepository
      .createQueryBuilder('tourism')
      .leftJoin('tourism.level', 'level')
      .leftJoin('tourism.admin', 'admin')
      .leftJoin('tourism.marketer', 'marketer');

    builder.select([
      'tourism.id',
      'tourism.name',
      'tourism.code',
      'tourism.address',
      'tourism.licenseFile',
      'tourism.status',
      'tourism.reasonRejected',
      'tourism.createdAt',

      'level.id',
      'level.name',
      'level.hotelCommissionPerPerson',
      'level.tourCommissionPerPerson',

      'admin.id',
      'admin.firstName',
      'admin.lastName',

      'marketer.id',
      'marketer.firstName',
      'marketer.lastName',
    ]);

    builder.andWhere({ id: tourismId });

    if (marketerId) {
      builder.andWhere({ marketerId });
    }

    return await builder.getOne();
  }

  /**
   * -------------------------------------------------------
   * GET /tourisms
   */
  async getTourisms(
    page = 1,
    limit = 20,
    filters = null,
    sorts = null,
    marketerId = null,
  ) {
    let builder = await this.tourismRepository
      .createQueryBuilder('tourism')
      .leftJoin('tourism.level', 'level')
      .leftJoin('tourism.admin', 'admin')
      .leftJoin('tourism.marketer', 'marketer');

    builder.select([
      'tourism.id',
      'tourism.name',
      'tourism.code',
      'tourism.address',
      'tourism.status',
      'tourism.createdAt',

      'level.id',
      'level.name',
      'level.hotelCommissionPerPerson',
      'level.tourCommissionPerPerson',

      'admin.id',
      'admin.firstName',
      'admin.lastName',

      'marketer.id',
      'marketer.firstName',
      'marketer.lastName',
    ]);

    builder = applyFiltersToBuilder(builder, filters);

    if (marketerId) {
      builder.andWhere({ marketerId });
    }

    if (sorts) {
      builder = applySortingToBuilder(builder, sorts);
    } else {
      builder.orderBy('tourism.createdAt', 'DESC');
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
   * insert tourisms
   */
  async addTourism(
    dto: CreateTourismDto,
    marketerId: number,
    licenseFile: Express.Multer.File,
  ) {
    const newTourism = new TourismEntity();
    for (const key in dto) {
      newTourism[key] = dto[key];
    }

    newTourism.licenseFile = `/tourisms/${licenseFile.filename}`;
    newTourism.marketerId = marketerId;
    newTourism.levelId = TourismLevelIds.base;
    newTourism.status = TourismStatus.new;
    newTourism.createdAt = new Date();

    const { identifiers } = await this.tourismRepository
      .createQueryBuilder()
      .insert()
      .values(newTourism)
      .execute();

    const newTourismId = identifiers[0].id;
    return await this.tourismRepository.findOne(newTourismId);
  }

  /**
   * -------------------------------------------------------
   * update tourism with adminId
   */
  async updateTourismWithAdminById(tourismId: number, adminId: number) {
    return await this.tourismRepository
      .createQueryBuilder()
      .update()
      .set({ adminId })
      .where({ id: tourismId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * update tourisms
   */
  async updateTourism(
    tourismId: number,
    dto: UpdateTourismDto,
    licenseFile: Express.Multer.File,
  ) {
    if (licenseFile) {
      dto.licenseFile = `/tourisms/${licenseFile.filename}`;
    }

    return await this.tourismRepository
      .createQueryBuilder()
      .update()
      .set({ ...dto, updatedAt: new Date() })
      .where({ id: tourismId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * update tourism wallet
   */
  async updateTourismWallet(tourismId: number, dto: UpdateWalletTourismDto) {
    const tourism = await this.tourismRepository.findOne({
      where: { id: tourismId },
      relations: ['admin'],
    });

    const newWallet = tourism.admin.wallet + dto.changeWallet;

    if (newWallet < 0) {
      this.error.unprocessableEntity([
        'اعتبار نهایی کیف پول نمی تواند کمتر از صفر باشد',
      ]);
    }

    tourism.admin.wallet = newWallet;
    await tourism.admin.save();

    // insert into wallet history
    await this.userService.addWalletHistory(
      tourism.admin.id,
      tourism.id,
      null,
      Math.abs(dto.changeWallet),
      dto.changeWallet >= 0 ? WalletType.commission : WalletType.withdraw,
    );

    return true;
  }

  /**
   * -------------------------------------------------------
   * POST /tourisms/level
   * add new level for tourism
   */

  async addLevel(dto: CreateTourismLevelDto) {
    const { identifiers } = await this.tourismLevelRepository
      .createQueryBuilder()
      .insert()
      .values(dto)
      .execute();

    const newLevelId = identifiers[0].id;
    return await this.tourismLevelRepository.findOne(newLevelId);
  }

  /**
   * -------------------------------------------------------
   * PUT /tourisms/level/1
   */
  async updateLevel(levelId: number, dto: UpdateTourismLevelDto) {
    return await this.tourismLevelRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: levelId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * DELETE /tourisms/level/1
   */
  async deleteLevelById(levelId: number) {
    if (+levelId === TourismLevelIds.base) {
      this.error.methodNotAllowed(['امکان حذف سطح های سیستمی وجود ندارد']);
    }

    try {
      return await this.tourismLevelRepository
        .createQueryBuilder()
        .delete()
        .where({ id: levelId })
        .execute();
    } catch (e) {
      this.error.methodNotAllowed([
        'امکان حذف این سطح به دلیل ارتباط با بخش های دیگر وجود ندارد',
      ]);
    }
  }

  /**
   * -------------------------------------------------------
   * PUT /tourism/by-marketer/1
   */
  async updateTourismByMarketer(
    tourismId: number,
    dto: UpdateTourismByMarketerDto,
    licenseFile: Express.Multer.File,
  ) {
    const data = await this.tourismRepository.findOne(tourismId);

    if (
      data.status === TourismStatus.inactive ||
      data.status === TourismStatus.verified
    ) {
      this.error.methodNotAllowed([
        `این آژانس ${
          data.status === TourismStatus.inactive ? 'غیرفعال' : 'فعال'
        } می‌باشد، امکان ویرایش وجود ندارد`,
      ]);
    }

    if (licenseFile) {
      dto.licenseFile = `/tourisms/${licenseFile.filename}`;
    }

    return await this.tourismRepository
      .createQueryBuilder()
      .update()
      .set({ ...dto, updatedAt: new Date(), status: TourismStatus.updated })
      .where({ id: tourismId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   *
   */
  async getRecordByTourismId(tourismId) {
    return await this.tourismRepository.findOne(tourismId);
  }

  /**
   * -------------------------------------------------------
   *
   */
  async getCodeById(tourismId) {
    return await this.tourismRepository.findOne({
      where: { id: tourismId },
      select: ['code'],
    });
  }
}
