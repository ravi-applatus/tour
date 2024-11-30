import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { TourismStatus } from '../entities/tourism.entity';

export class UpdateTourismDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  levelId: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  licenseFile: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ required: true, enum: TourismStatus })
  @IsIn(Object.values(TourismStatus))
  @IsNotEmpty()
  status: TourismStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  reasonRejected?: string;
}
