import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty({ message: 'لطفا شناسه مسافرین موردنظر را وارد نمایید' })
  @ApiProperty({ required: true })
  customerIds: number[];

  @IsOptional()
  @ApiProperty({ required: false })
  number: string;

  @IsOptional()
  @ApiProperty({ required: false })
  tourismNumber: string;

  @IsOptional()
  @ApiProperty({ required: false })
  systemNumber: string;

  @IsOptional()
  @ApiProperty({ required: false })
  transferId: number;
}
