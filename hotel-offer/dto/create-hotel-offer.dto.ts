import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHotelOfferDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  hotelId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  levelId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  from: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  to: string;

  @ApiProperty({ required: false })
  @IsOptional()
  discount: number;
}
