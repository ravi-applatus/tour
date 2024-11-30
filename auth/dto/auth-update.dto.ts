import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotExist } from '../../../utils/validators/is-not-exists.validator';

export class AuthUpdateDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  mobile?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase().trim())
  @Validate(IsNotExist, ['UserEntity'], {
    message: 'با این ایمیل قبلا ثبت نام انجام شده است',
  })
  @IsEmail(
    {},
    {
      message: 'ایمیل وارد شده نامعتبر است',
    },
  )
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ibanDollar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ibanRial?: string;
}
