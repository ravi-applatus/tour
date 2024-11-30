import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateContentHotelDto {
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
  description: string;
}
