import { Injectable } from '@nestjs/common';
import { ErrorService } from '../../error/error.service';
import { TransferEntity } from './entities/transfer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(TransferEntity)
    private transferRepository: Repository<TransferEntity>,

    private error: ErrorService,
  ) {}

  /**
   * -------------------------------------------------------
   * POST /transfers
   */
  async addTransfer(dto: CreateTransferDto, canGetFinancialInfo = false) {
    if (!canGetFinancialInfo) {
      delete dto.buyPrice;
    }

    const { identifiers } = await this.transferRepository
      .createQueryBuilder()
      .insert()
      .values(dto)
      .execute();

    const newTransferId = identifiers[0].id;
    return await newTransferId;
  }

  /**
   * -------------------------------------------------------
   * PUT /transfers/:id
   */
  async updateTransfer(
    transferId: number,
    dto: UpdateTransferDto,
    canGetFinancialInfo = false,
  ) {
    if (!canGetFinancialInfo) {
      delete dto.buyPrice;
    }

    return await this.transferRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: transferId })
      .execute();
  }

  /**
   * -------------------------------------------------------
   * GET /transfers
   */
  async getTransfers(
    tourismLevelId = null,
    tourismId = null,
    canGetFinancialInfo = false,
  ) {
    const builder = this.transferRepository.createQueryBuilder('transfer');

    builder.select([
      'transfer.id',
      'transfer.name',
      'transfer.price',
      'transfer.description',
      'transfer.isActive',
    ]);

    // For tourism manager and employee
    if (tourismId || tourismLevelId) {
      builder.andWhere({ isActive: true });
    }

    if (canGetFinancialInfo) {
      builder.addSelect(['transfer.buyPrice']);
    }

    return await builder.getMany();
  }

  /**
   * -------------------------------------------------------
   * GET /transfers/1
   */
  async getTransferById(
    transferId: number,
    tourismLevelId = null,
    tourismId: number = null,
    canGetFinancialInfo = false,
  ) {
    const builder = this.transferRepository.createQueryBuilder('transfer');

    builder.select([
      'transfer.id',
      'transfer.name',
      'transfer.price',
      'transfer.description',
      'transfer.isActive',
    ]);

    // For tourism manager and employee
    if (tourismId || tourismLevelId) {
      builder.andWhere({ isActive: true });
    }

    if (canGetFinancialInfo) {
      builder.addSelect(['transfer.buyPrice']);
    }

    return await builder.andWhere({ id: transferId }).getOne();
  }
}
