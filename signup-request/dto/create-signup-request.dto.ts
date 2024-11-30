import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSignupRequestDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  tourismName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  address: string;
}
