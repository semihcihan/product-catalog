import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';
import { AppException } from 'src/exceptions/exception';

@Injectable()
export class SharpPipe
  implements PipeTransform<Array<Express.Multer.File>, Promise<Array<string>>>
{
  async transform(images: Array<Express.Multer.File>): Promise<Array<string>> {
    if (images.some((i) => i.size > 10 * 1024 * 1024)) {
      throw new AppException('File is too big', HttpStatus.BAD_REQUEST);
    }

    return await Promise.all(
      images.map(async (image) => {
        const originalName = path
          .parse(image.originalname)
          .name.replace(/ /g, '-');
        console.log(originalName);
        const filename = Date.now() + '-' + originalName + '.jpeg';

        await sharp(image.buffer)
          .resize(800)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/products/${filename}`);

        return filename;
      }),
    );
  }
}
