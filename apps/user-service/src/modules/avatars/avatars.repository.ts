import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/infra/prisma/prisma.service';
import { CreateRequest } from './dto/requests/create.request.dto';

@Injectable()
export class AvatarsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(dto: CreateRequest) {
    const data = dto.files.map((file) => ({
      userId: dto.userId,
      filePath: file.originalname,
    }));
    await this.prismaService.avatar.createMany({
      data,
    });
  }

  public async delete(dto: { avatarId: string; userId: string }) {
    const { userId, avatarId } = dto;
    await this.prismaService.avatar.delete({
      where: { id: avatarId, userId },
    });
  }

  public async findAll(userId: string) {
    return this.prismaService.avatar.findMany({
      where: { userId },
    });
  }
}
