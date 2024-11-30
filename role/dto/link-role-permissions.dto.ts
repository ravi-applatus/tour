import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LinkRolePermissionsDto {
  @ApiProperty({ isArray: true })
  @IsNotEmpty()
  permissionsId: number[];
}
