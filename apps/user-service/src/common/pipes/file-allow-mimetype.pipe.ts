import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const ALLOWS_MEMITYPE = ['image/png', 'image/jpeg'];

@Injectable()
export class FileAllowMimetypePipe implements PipeTransform {
  transform(value: Array<Express.Multer.File>): any {
    value.map((file) => {
      if (!ALLOWS_MEMITYPE.includes(file.mimetype))
        throw new BadRequestException(
          'можно загружать только png или jpeg аватарки',
        );
    });
    return value;
  }
}
