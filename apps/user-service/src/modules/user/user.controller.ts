import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import {
  FindOneResponse,
  FindOneResponseDto,
} from './dto/responses/find-one.response.dto';
import { ZodResponse } from 'nestjs-zod';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { FindAllRequestDto } from './dto/requests/find-all.request.dto';
import { DeleteResponseDto } from './dto/responses/delete.response.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { type JwtPayload } from '../auth/auth.service';
import { JwtPayloadDto } from '../auth/dto/responses/jwt.response.dto';
import { FindPopularRequestDto } from './dto/requests/find-popular.request.dto';
import {
  Cachable,
  CacheScope,
} from '@app/my-library/common/decorators/cachable.decorator';
import { Eviction } from '@app/my-library/common/decorators/eviction.decorator';
import { TransferMoneyRequestDto } from './dto/requests/transfer-money.request.dto';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Cachable({ ttl: '180', scope: CacheScope.USER })
  @ZodResponse({ type: FindOneResponseDto })
  @Get('profile/me')
  public async findOne(
    @CurrentUser() user: JwtPayload,
  ): Promise<FindOneResponse> {
    const userProfile = await this.userService.findOne(user.sub);
    return userProfile;
  }

  @Get('popular')
  public async findPopular(@Query() query: FindPopularRequestDto) {
    return this.userService.findPopular(query);
  }

  @Cachable({ ttl: '180', scope: CacheScope.SHARED })
  @Get('profile/all')
  @ZodResponse({ type: [FindOneResponseDto] })
  public async findAll(@Query() query: FindAllRequestDto) {
    const { limit, offset, login } = query;
    const users = await this.userService.findAll({ limit, offset, login });
    return users;
  }

  @Eviction('/user/profile/me/{user_id}', '/user/profile/all*')
  @Delete()
  @ZodResponse({ type: DeleteResponseDto })
  public async delete(@CurrentUser() user: JwtPayload) {
    const id = user.sub;
    return this.userService.delete(id);
  }

  @ApiExcludeEndpoint()
  @ApiBearerAuth()
  @Eviction('/user/profile/me/{user_id}')
  @ZodResponse({ type: JwtPayloadDto })
  @Get('check')
  public checkDec(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Eviction(
    '/user/profile/me/{user_id}',
    '/user/profile/me/{target_user_id}',
    '/user/profile/all*',
  )
  @Post('transfer')
  public async transferMoney(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TransferMoneyRequestDto,
  ) {
    return this.userService.transfer(dto, user.sub, user.login);
  }
}
