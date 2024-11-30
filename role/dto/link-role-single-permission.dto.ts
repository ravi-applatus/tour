import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export enum LinkSingleType {
  link = 'link',
  unlink = 'unlink',
}

export class LinkRoleSinglePermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  permissionId: number;

  @ApiProperty({ enum: LinkSingleType })
  @IsNotEmpty()
  @IsIn(Object.values(LinkSingleType))
  type: LinkSingleType;
}
