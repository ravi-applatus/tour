import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { IsNotExist } from '../../../utils/validators/is-not-exists.validator';

export class CreateTourismDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  licenseFile: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ required: true })
  @Validate(IsNotExist, ['TourismEntity'], {
    message: 'این کد سه حرفی قبلا رزرو شده است، کد دیگری وارد نمایید',
  })
  @IsNotEmpty()
  code: string;
}
