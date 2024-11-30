import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateHotelImageDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  hotelId: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: any;
}
