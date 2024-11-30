import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, ValidateIf } from 'class-validator';

export enum LinkSingleType {
  link = 'link',
  unlink = 'unlink',
}

export class SingleFeatureToTourDto {
  @ApiProperty()
  @IsNotEmpty()
  featureId: number;

  @ApiProperty()
  @ValidateIf((p) => p.type === LinkSingleType.link)
  @IsNotEmpty()
  isOptional: boolean;

  @ApiProperty()
  @ValidateIf((p) => p.type === LinkSingleType.link && p.isOptional)
  @IsNotEmpty({ message: 'هزینه سرویس اجباری است' })
  price: number;

  @ApiProperty({ enum: LinkSingleType })
  @IsNotEmpty()
  @IsIn(Object.values(LinkSingleType))
  type: LinkSingleType;
}
