import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;
}
