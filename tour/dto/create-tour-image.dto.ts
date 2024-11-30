import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTourImageDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  tourId: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: any;
}
