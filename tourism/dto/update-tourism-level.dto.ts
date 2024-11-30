import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTourismLevelDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  hotelCommissionPerPerson: number;

  @ApiProperty({ required: false })
  @IsOptional()
  tourCommissionPerPerson: number;
}
