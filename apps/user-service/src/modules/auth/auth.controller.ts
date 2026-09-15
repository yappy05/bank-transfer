import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/requests/register.request.dto';
import { Public } from '../../common/decorators/public.decorator';
import { LoginRequestDto } from './dto/requests';
import { ZodResponse } from 'nestjs-zod';
import { JwtResponse, JwtResponseDto } from './dto/responses/jwt.response.dto';

import { RefreshRequestDto } from './dto/requests/refresh.request.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectQueue('auth') authQueue: Queue,
    private readonly authService: AuthService,
  ) {}

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
}
