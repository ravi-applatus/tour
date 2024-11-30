import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { HotelStatus } from '../entities/hotel.entity';

export class UpdateHotelDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  star?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  managerName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  address: string;

  @ApiProperty({ required: false })
  @IsOptional()
  locationLat: string;

  @ApiProperty({ required: false })
  @IsOptional()
  locationLng: string;

  @ApiProperty({ required: false })
  @IsOptional()
  country: string;

  @ApiProperty({ required: false })
  @IsOptional()
  state: string;

  @ApiProperty({ required: false })
  @IsOptional()
  city: string;

  @ApiProperty({ required: false })
  @IsOptional()
  coverId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  needOrderConfirmAvailability: boolean;

  @ApiProperty({ required: false, enum: HotelStatus })
  @IsOptional()
  @IsIn(Object.values(HotelStatus))
  status: HotelStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  description: string;
}
