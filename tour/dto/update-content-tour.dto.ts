import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateContentTourDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  destinationCity: string;

  @ApiProperty({ required: false })
  @IsOptional()
  destinationCountry: string;

  @ApiProperty({ required: false })
  @IsOptional()
  coverId: number;
}
