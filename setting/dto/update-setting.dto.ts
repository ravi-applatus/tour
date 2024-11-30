import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CurrencySources } from '../entities/setting.entity';

export class UpdateSettingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  startWorkingTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  endWorkingTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  passengersInfoUpdateDeadlineHours: number;

  @ApiProperty({ required: false })
  @IsOptional()
  bankTransferDescription: string;

  @ApiProperty({ required: false })
  @IsOptional()
  voucherDescription: string;

  @ApiProperty({ required: false })
  @IsOptional()
  transferBoard: string;

  @ApiProperty({ required: false })
  @IsOptional()
  transferPhone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  transferPhone2: string;

  @ApiProperty({ required: false })
  @IsOptional()
  transferExcursion: string;

  @ApiProperty({ required: false })
  @IsOptional()
  adminName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  adminPhone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  adminFax: string;

  @ApiProperty({ required: false })
  @IsOptional()
  adminEmail: string;

  @ApiProperty({ required: false, enum: CurrencySources })
  @IsIn(Object.values(CurrencySources))
  @IsOptional()
  currencySource: CurrencySources;
}
