import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { TourStatus } from '../entities/tour.entity';

export class UpdateTourDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  managerName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  destinationCity: string;

  @ApiProperty({ required: false })
  @IsOptional()
  destinationCountry: string;

  @ApiProperty({ required: false })
  @IsOptional()
  transportType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  coverId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  commissionPerPerson: number;

  @ApiProperty({ required: false })
  @IsOptional()
  percentageCommission: number;

  @ApiProperty({ required: false, enum: TourStatus })
  @IsOptional()
  @IsIn(Object.values(TourStatus))
  status: TourStatus;
}
