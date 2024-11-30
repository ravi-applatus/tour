import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateWalletTourismDto {
  @ApiProperty()
  @IsNotEmpty()
  changeWallet: number;
}
