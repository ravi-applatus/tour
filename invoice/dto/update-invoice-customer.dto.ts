import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { CustomerGenders } from '../entities/invoice-customer.entity';

export class UpdateInvoiceCustomerDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  id: number;

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

  @ApiProperty({ required: false, description: '2022-08-09' })
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
  identityCardNumber: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  passportFile: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  passportNumber: string;
}
