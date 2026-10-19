import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { BullModule } from '@nestjs/bullmq';

@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<StringValue>(
            'JWT_ACCESS_EXPIRES_IN',
          ),
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
    BullModule.registerQueue({ name: 'auth' }),
    UserModule,
  ],
})
export class AuthModule {}
