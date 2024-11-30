import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateHotelOfferDto {
  @ApiProperty({ required: false })
  @IsOptional()
  levelId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  from: string;

  @ApiProperty({ required: false })
  @IsOptional()
  to: string;

  @ApiProperty({ required: false })
  @IsOptional()
  discount: number;
}
