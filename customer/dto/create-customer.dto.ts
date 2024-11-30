import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { CustomerGenders } from '../entities/customer.entity';

export class CreateCustomerDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false, enum: CustomerGenders })
  @IsOptional()
  @IsIn(Object.values(CustomerGenders))
  gender: CustomerGenders;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  birthday?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : +value))
  age: number;

  @ApiProperty({ required: false })
  @IsOptional()
  disability?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  identityCardFile: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsNotExist, ['CustomerEntity'], {
    message: ' این مشتری با این کد ملی قبلا ثبت نام شده است',
  })
  identityCardNumber: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  passportFile: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Validate(IsNotExist, ['CustomerEntity'], {
    message: ' این مشتری با این شماره پاسپورت قبلا ثبت نام شده است',
  })
  passportNumber: string;
}
