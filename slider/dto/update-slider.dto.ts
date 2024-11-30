import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateSliderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  isActive: boolean;
}
