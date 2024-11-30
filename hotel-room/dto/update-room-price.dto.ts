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

export class UpdateRoomPriceDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  roomId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  levelId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'قیمت فروش نمی‌تواند خالی باشد' })
  price: number;

  @ApiProperty({ required: true })
  @IsNotEmpty({
    message:
      'قیمت extra یک کودک نمی‌تواند خالی باشد، در صورت نداشتن این قیمت، صفر وارد نمایید',
  })
  childExtraPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  buyPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  childExtraBuyPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  from: string;

  @ApiProperty({ required: false })
  @IsOptional()
  to: string;

  @ApiProperty({ required: false })
  @IsOptional()
  priceId: number;

  @ApiProperty({ required: false, type: [ChildPrice] })
  @IsOptional()
  @Type(() => ChildPrice)
  childPrices: ChildPrice[];
}
