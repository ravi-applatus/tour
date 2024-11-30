import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateTourismByMarketerDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  licenseFile: any;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  address: string;
}
