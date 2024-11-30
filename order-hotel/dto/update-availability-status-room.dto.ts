import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { AvailabilityStatus } from '../entities/order-hotel-map-room.entity';

export class UpdateAvailabilityStatusRoomDto {
  @ApiProperty({ required: true, enum: AvailabilityStatus })
  @IsNotEmpty()
  @IsIn(Object.values(AvailabilityStatus))
  availabilityStatus: AvailabilityStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  availabilityReasonRejected: string;

  @ApiProperty({ required: false })
  @IsOptional()
  maxCapacity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  maxExtraCapacity: number;
}
