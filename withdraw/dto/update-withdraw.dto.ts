import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { WithdrawStatus } from '../entities/withdraw.entity';

export class UpdateWithdrawDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  status: WithdrawStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  reasonRejected: string;
}
