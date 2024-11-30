import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateTransferInfoDto {
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
}
