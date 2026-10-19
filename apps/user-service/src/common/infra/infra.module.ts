import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from '@app/my-library/common/infra/redis/redis.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    RedisModule.forRoot({ host: 'localhost', port: 6379, password: 'redis' }),
  ],
  exports: [RedisModule],
})
export class InfraModule {}
