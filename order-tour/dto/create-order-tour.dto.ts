import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderTourDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  tourId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  featureIds: number[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  invoiceId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  customerIds: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  description: string;
}
