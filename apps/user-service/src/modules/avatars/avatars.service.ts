import { ConflictException, Injectable } from '@nestjs/common';
import { IFileService } from '../../providers/files/files.adapter';
import { IUploadedMulterFile } from '../../providers/files/s3/interfaces/upload-file.interface';
import { CreateRequest } from './dto/requests/create.request.dto';
import { AvatarsRepository } from './avatars.repository';

@Injectable()
export class AvatarsService {
  constructor(
    private readonly fileService: IFileService,
    private readonly avatarRepository: AvatarsRepository,
  ) {}

  public async create(dto: CreateRequest) {
    const { files, userId } = dto;
    files.map(async (file) => {
      const f = this.mapperS3File(file);
      await this.fileService.uploadFile({
        file: f,
        folder: '/avatars',
        name: file.originalname,
      });
    });
    const countAvatars = await this.getCountAvatars(userId);
    if (countAvatars > 5)
      throw new ConflictException('Не может быть загруженно больше 5 аватаров');
    await this.avatarRepository.create(dto);
  }

  public async findAll(userId: string) {
    return this.avatarRepository.findAll(userId);
  }

  public async delete(dto: { avatarId: string; userId: string }) {
    await this.avatarRepository.delete(dto);
    return { success: true };
  }

  private mapperS3File = (file: IUploadedMulterFile): IUploadedMulterFile => {
    return {
      fieldname: file.fieldname,
      buffer: file.buffer,
      encoding: file.encoding,
      size: file.size,
      originalname: file.originalname,
      mimetype: file.mimetype,
    };
  };

  private async getCountAvatars(userId: string) {
    const avatars = await this.avatarRepository.findAll(userId);
    return avatars.length;
  }
}
