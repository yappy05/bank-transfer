import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterRequestDto } from './dto/requests/register.request.dto';
import { UserService } from '../user/user.service';
import { LoginRequestDto } from './dto/requests';
import * as argon2 from 'argon2';
import { User } from '../../../prisma/generated/client';
import { JwtResponse } from './dto/responses/jwt.response.dto';
import { RefreshRequest } from './dto/requests/refresh.request.dto';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

export type JwtPayload = {
  sub: string;
  login: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async register(dto: RegisterRequestDto): Promise<JwtResponse> {
    const { id, login } = await this.userService.create(dto);
    return this.generateTokens(id, login);
  }

  public async login(dto: LoginRequestDto): Promise<JwtResponse> {
    const { login, password } = dto;
    let user: User;
    try {
      user = await this.userService.findOneByLogin(login);
    } catch (e) {
      if (e instanceof NotFoundException) throw new UnauthorizedException();
      throw e;
    }
    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) throw new UnauthorizedException();

    return this.generateTokens(user.id, user.login);
  }

  public async refresh(dto: RefreshRequest): Promise<JwtResponse> {
    const { refreshToken } = dto;
    const isValid: JwtPayload =
      this.jwtService.verify<JwtPayload>(refreshToken);
    if (!isValid) throw new UnauthorizedException('Not valid refresh token');
    const { sub, login } = isValid;
    return this.generateTokens(sub, login);
  }

  private async generateTokens(
    id: string,
    login: string,
  ): Promise<JwtResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: id, login }),
      this.jwtService.signAsync(
        { sub: id, login },
        {
          expiresIn: this.configService.getOrThrow<StringValue>(
            'JWT_REFRESH_EXPIRES_IN',
          ),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  public async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token);
  }
}
