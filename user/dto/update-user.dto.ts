import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  mobile: string;

  @ApiProperty({ example: 'test1@example.com' })
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
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  roleId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  tourismId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  identityCardNumber: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  identityCardFile: any;

  @ApiProperty({ required: true })
  @IsOptional()
  status: UserStatus;
}
