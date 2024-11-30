import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { IsExist } from '../../../utils/validators/is-exists.validator';

export class AuthForgotByEmailDto {
  @ApiProperty({ example: 'test1@example.com' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  @Validate(IsExist, ['UserEntity'], {
    message: 'ایمیل وارد شده در سیستم وجود ندارد',
  })
  @IsEmail(
    {},
    {
      message: 'ایمیل وارد شده نامعتبر است',
    },
  )
  email: string;
}
