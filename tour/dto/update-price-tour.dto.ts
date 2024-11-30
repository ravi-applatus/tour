import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

class ChildPrice {
  @ApiProperty()
  ageFrom: number;

  @ApiProperty()
  ageTo: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  buyPrice: number;
}

export class UpdatePriceTourDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  tourId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  levelId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  buyPrice: number;

  @ApiProperty({ required: false, type: [ChildPrice] })
  @IsOptional()
  @Type(() => ChildPrice)
  childPrices: ChildPrice[];
}
