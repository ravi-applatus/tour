import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateAvailabilityRoomDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  roomId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  availabilityCount: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  from: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  to: string;
}
