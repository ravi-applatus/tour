import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  InvoicePassengersInfoStatus,
  InvoiceStatus,
} from '../entities/invoice.entity';

export class UpdateInvoiceDto {
  @ApiProperty({ required: true, enum: InvoicePassengersInfoStatus })
  @IsOptional()
  @IsIn(Object.values(InvoicePassengersInfoStatus))
  passengersInfoStatus: InvoicePassengersInfoStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  passengersInfoReasonRejected: string;

  @ApiProperty({ required: true, enum: InvoiceStatus })
  @IsOptional()
  @IsIn(Object.values(InvoiceStatus))
  status: InvoiceStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  reasonRejected: string;
}
