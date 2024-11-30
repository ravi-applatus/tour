import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  exchange: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  exchangeIRR: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  isActive: boolean;
}
