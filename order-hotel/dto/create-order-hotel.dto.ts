import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

class room {
  @ApiProperty()
  id: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  customerIds: number[];
}

export class CreateOrderHotelDto {
  @ApiProperty({ required: false })
  @IsOptional()
  invoiceId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  hotelId: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  featureIds: number[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  checkIn: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  checkOut: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  arrivalAirline: string;

  @ApiProperty({ required: false })
  @IsOptional()
  arrivalDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  arrivalNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  departureAirline: string;

  @ApiProperty({ required: false })
  @IsOptional()
  departureDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  departureNumber: string;

  @IsNotEmpty({ message: 'لطفا تعداد هر نوع اتاق را وارد نمایید' })
  @ApiProperty({ required: true, type: [room] })
  // @ValidateNested({ each: true }) // BUG
  @Type(() => room)
  rooms: room[];
}
