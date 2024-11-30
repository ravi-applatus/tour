import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class UpadatePaymentDto {
  @ApiProperty({ required: true, enum: PaymentStatus })
  @IsNotEmpty()
  @IsIn(Object.values(PaymentStatus))
  status: PaymentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  reasonRejected: string;
}
