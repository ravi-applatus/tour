import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRoomDto {
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

  @ApiProperty({ required: true })
  @IsNotEmpty()
  isActive: boolean;
}
