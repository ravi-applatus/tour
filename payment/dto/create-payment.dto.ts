import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  invoiceId: number;
}
