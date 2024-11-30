import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { IsNotExist } from '../../../utils/validators/is-not-exists.validator';

export class CreateHotelDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @Validate(IsNotExist, ['HotelEntity'], {
    message: 'این کد سه حرفی قبلا رزرو شده است، کد دیگری وارد نمایید',
  })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  star: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  managerName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ required: false })
  @IsOptional()
  locationLat: string;

  @ApiProperty({ required: false })
  @IsOptional()
  locationLng: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  country: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  state: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description: string;
}
