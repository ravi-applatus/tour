import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateAvailabilityTourDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  availabilityCount: number;
}
