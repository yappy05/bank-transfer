import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/requests';
import { Public } from '../../common/decorators/public.decorator';
import { LoginRequestDto } from './dto/requests';
import { ZodResponse } from 'nestjs-zod';
import { JwtResponse, JwtResponseDto } from './dto/responses/jwt.response.dto';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { RefreshRequestDto } from './dto/requests/refresh.request.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TokenExpiredError } from '@nestjs/jwt';
import { VerifyJwtResponse } from '@app/my-library/contracts/proto/generate/auth';

@Controller('auth')
export class AuthController {
  logger: Logger;
  constructor(
    @InjectQueue('auth') authQueue: Queue,
    private readonly authService: AuthService,
  ) {
    this.logger = new Logger(AuthController.name);
  }

  @Public()
  @ZodResponse({ type: JwtResponseDto })
  @Post('login')
  public async login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }

  @Public()
  @ZodResponse({ type: JwtResponseDto })
  @Post('register')
  public async register(@Body() dto: RegisterRequestDto): Promise<JwtResponse> {
    const tokens: JwtResponse = await this.authService.register(dto);
    return tokens;
  }

  @Public()
  @ZodResponse({ type: JwtResponseDto })
  @Post('refresh')
  public async refreshToken(@Body() data: RefreshRequestDto) {
    return await this.authService.refresh(data);
  }

  @Public()
  @GrpcMethod('AuthService', 'VerifyJwt')
  public async verifyToken(data: {
    token: string;
  }): Promise<VerifyJwtResponse> {
    console.log('data', data);
    try {
      const response: VerifyJwtResponse = await this.authService.verifyToken(
        data.token,
      );
      console.log(response);
      return response;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        this.logger.debug(`Token ${data.token.slice(0, 6)}... is expires`);
        throw new RpcException('посроченный токен');
      }
      this.logger.warn(
        'Неожиданная ошибка при валидации токена. Возможно непраивльный формат',
      );
      throw new RpcException('невалидный токен');
    }
  }
}
