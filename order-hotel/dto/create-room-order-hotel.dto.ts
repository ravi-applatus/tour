import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

export class CreateRoomOrderHotelDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  roomId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Min(1, { message: 'حداقل تعداد اتاق درخواستی، یک می‌باشد' })
  quantity: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  orderHotelId: number;
}
