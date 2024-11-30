import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class UpdateUserTourismDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  mobile: string;

  @ApiProperty({ example: 'test1@example.com' })
  @IsNotEmpty()
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
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  identityCardNumber: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  identityCardFile: any;
}
