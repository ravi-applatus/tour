import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Validate, ValidateIf } from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { RoleIds } from '../../role/entities/role.entity';
import { UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  lastName: string;

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

  @ApiProperty({ required: false })
  @ValidateIf((p) =>
    [RoleIds.TOURISM_MANAGER, RoleIds.TOURISM_EMPLOYEE].includes(p.roleId),
  )
  @IsNotEmpty({ message: 'انتخاب آژانس الزامی است' })
  tourismId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  status: UserStatus;
}
