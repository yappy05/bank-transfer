import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { softDeleteExtension } from './soft-delete.extension';

const SOFT_DELETE_MODELS = ['User', 'Avatar'] as const;

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
    const adapter = new PrismaPg(databaseUrl);
    super({
      adapter,
    });
    // Конструктор возвращает расширенный клиент: все, кто инжектит
    // PrismaService, получают soft-delete для моделей из SOFT_DELETE_MODELS.
    return this.$extends(
      softDeleteExtension(this, [...SOFT_DELETE_MODELS]),
    ) as this;
  }
}
