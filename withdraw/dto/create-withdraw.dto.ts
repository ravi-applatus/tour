import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWithdrawDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  rialRequest: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  ibanRial: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ibanDollar: string;
}
