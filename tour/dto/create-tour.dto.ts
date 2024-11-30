import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTourDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  managerName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  destinationCity: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  destinationCountry: string;

  @ApiProperty({ required: false })
  @IsOptional()
  transportType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  commissionPerPerson: number;

  @ApiProperty({ required: false })
  @IsOptional()
  percentageCommission: number;
}
