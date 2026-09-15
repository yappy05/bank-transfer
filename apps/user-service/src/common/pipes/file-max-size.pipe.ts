import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileMaxSizePipe implements PipeTransform {
  transform(value: Array<Express.Multer.File>): any {
    value.map((file) => {
      if (file.size >= 5242880)
        throw new BadRequestException(
          'слишком большая автотарка, размер должен быть меньше 5 мб',
        );
    });
    return value;
  }
}
