import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { PermissionsGuard } from '../auth/permission/permissions.guard';
import { PermissionsType } from '../role/entities/permission.entity';
import { Permissions } from '../auth/permission/permissions.decorator';
import { successfulResult } from '../../utils';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Access } from '../../utils/decorators/access.decorator';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { User } from '../../utils/decorators/user.decorator';

@ApiTags('Transfer')
@Controller('transfers')
export class TransferController {
  constructor(private transferService: TransferService) {}

  /**
   * -------------------------------------------------------
   * POST /transfers
   */
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.ADD_TRANSFER)
  async addTransfer(
    @Body() dto: CreateTransferDto,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TRANSFER) canGetFinancialInfo,
  ) {
    const newTransfer = await this.transferService.addTransfer(
      dto,
      canGetFinancialInfo,
    );
    return successfulResult(['ترنسفر جدید باموفقیت اضافه شد'], newTransfer);
  }

  /**
   * -------------------------------------------------------
   * PUT /transfers/:id
   */
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsType.UPDATE_TRANSFER)
  async updateTransfer(
    @Param('id') transferId: number,
    @Body() dto: UpdateTransferDto,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TRANSFER) canGetFinancialInfo,
  ) {
    await this.transferService.updateTransfer(
      transferId,
      dto,
      canGetFinancialInfo,
    );
    return successfulResult(['ترنسفر موردنظر با موفقیت ویرایش شد']);
  }

  /**
   * -------------------------------------------------------
   * GET /transfers
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_TRANSFER,
    PermissionsType.GET_FINANCIAL_INFO_TRANSFER,
  )
  async getTransfers(
    @User('tourismId') tourismId,
    @Query('tourism_level_id') tourismLevelId,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TOUR) canGetFinancialInfo,
  ) {
    const data = await this.transferService.getTransfers(
      tourismLevelId,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }

  /**
   * -------------------------------------------------------
   * GET /transfers/1
   */
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(
    PermissionsType.GET_TRANSFER,
    PermissionsType.GET_FINANCIAL_INFO_TRANSFER,
  )
  async getTransferById(
    @Param('id') transferId: number,
    @Query('tourism_level_id') tourismLevelId,
    @User('tourismId') tourismId: number,
    @Access(PermissionsType.GET_FINANCIAL_INFO_TRANSFER) canGetFinancialInfo,
  ) {
    const data = await this.transferService.getTransferById(
      transferId,
      tourismLevelId,
      tourismId,
      canGetFinancialInfo,
    );
    return successfulResult([], data);
  }
}
