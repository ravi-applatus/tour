import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Common')
@Controller()
export class CommonController {
  @Get('ping')
  async getPing() {
    return 'pong';
  }

  @Get('static/:path/:filename')
  seeUploadedFile(
    @Param('path') path: string,
    @Param('filename') filename: string,
    @Res() res,
  ) {
    return res.sendFile(`${path}/${filename}`, { root: './uploads' });
  }
}
