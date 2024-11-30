import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthLoginDto {
  @ApiProperty({ example: 'a@a.com' })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsNotEmpty()
  emailOrMobile: string;

  @ApiProperty({ example: '1234567' })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  rememberMe: boolean;
}
