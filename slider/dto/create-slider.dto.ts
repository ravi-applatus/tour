import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { stringToBool } from '../../../utils';

export class CreateSliderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  levelId: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: any;

  @ApiProperty({ required: false })
  @IsOptional()
  from: string;

  @ApiProperty({ required: false })
  @IsOptional()
  to: string;

  @ApiProperty({ required: true })
  @Transform(({ value }) => stringToBool(value))
  @IsNotEmpty()
  isActive: boolean;
}
