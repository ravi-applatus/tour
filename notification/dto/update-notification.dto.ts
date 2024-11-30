import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  isReaded: boolean;
}
