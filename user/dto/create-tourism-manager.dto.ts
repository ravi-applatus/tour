import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class CreateTourismManagerDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  tourismId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
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

  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  identityCardNumber: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  identityCardFile: any;
}
