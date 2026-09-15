import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { InfraModule } from './common/infra/infra.module';
import { ConfigModule } from '@nestjs/config';
import { JwtGuard } from './common/guards/jwt.guard';
import { CustomZodSerializerInterceptor } from '@app/my-library/common/interceptors/zod-serializer.interceptor';
import { CustomZodValidationPipe } from '@app/my-library/common/pipes/zod-validation.pipe';
import { HttpExceptionFilter } from '@app/my-library/common/filters/zod.filter';
import { z } from 'zod';
import { AvatarsModule } from './modules/avatars/avatars.module';
import { BalanceModule } from './modules/balance/balance.module';
import { LoggerInterceptor } from '@app/my-library/common/interceptors/logger.interceptor';
import { BullModule } from '@nestjs/bullmq';

const configSchema = z
  .object({
    POSTGRES_PASSWORD: z.string('пароль бд сотгрес'),
    POSTGRES_USER: z.string('имя пользователя бд постгрес'),
    DATABASE_URL: z.string('url ссылка для подключения orm prisma'),
    JWT_SECRET: z.string('секретная подпись'),
    JWT_ACCESS_EXPIRES_IN: z.string('время жизни access токена'),
    JWT_REFRESH_EXPIRES_IN: z.string('время жизни refresh токена'),
  })
  .required();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        try {
          return configSchema.parse(config);
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errors = error.issues.map((e) => {
              const path = e.path.join('.');
              return `  • ${path}: ${e.message}`;
            });
            console.error(
              `Ошибка валидации переменных окружения:\n${errors.join('\n')}\nДанные можно взять из .env.dev`,
            );
            process.exit(1);
          }
          throw error;
        }
      },
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        password: 'redis',
      },
    }),
    AuthModule,
    UserModule,
    InfraModule,
    AvatarsModule,
    BalanceModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JwtGuard,
    },
    {
      provide: 'APP_PIPE',
      useClass: CustomZodValidationPipe,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: CustomZodSerializerInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggerInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
