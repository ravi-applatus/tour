import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  buyPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  description: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  isActive: boolean;
}
