import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

export const multerOptions = (
  customPath = null,
  customMimeType = ['jpg', 'jpeg', 'png'],
  customeFileSize = 1024 * 1024 * 20, // 20 MB
) => ({
  limits: {
    fileSize: customeFileSize,
  },
  fileFilter: (req, file, callback) => {
    const regex = new RegExp(`\/(${customMimeType.join('|')})$`);
    if (file.mimetype.match(regex)) {
      // Allow storage of file
      callback(null, true);
    } else {
      // Reject file
      callback(
        new HttpException(
          `امکان آپلود فایل با فرمت ${path.extname(
            file.originalname,
          )} وجود ندارد!`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
        false,
      );
    }
  },
  storage: diskStorage({
    destination: `./uploads${customPath ? `/${customPath}` : ''}`,
    filename: (req, file, callback) => {
      //Calling the callback passing the random name generated with the original extension name
      callback(null, `${uuid()}${path.extname(file.originalname)}`);
    },
  }),
});
