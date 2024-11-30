import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SavePaymentTransferDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  invoiceId: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  transferFile: any;

  @ApiProperty({ required: false })
  @IsOptional()
  transferDescription: string;
}
