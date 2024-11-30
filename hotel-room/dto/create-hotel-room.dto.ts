import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateHotelRoomDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  hotelId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  type: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  maxCapacity: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  maxExtraCapacity: number;
}
