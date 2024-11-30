import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { SignupRequestStatus } from '../entities/signup-request.entity';

export class UpdateSignupRequestDto {
  @ApiProperty({ required: false, enum: SignupRequestStatus })
  @IsNotEmpty()
  @IsIn(Object.values(SignupRequestStatus))
  status: SignupRequestStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  adminComment: string;
}
