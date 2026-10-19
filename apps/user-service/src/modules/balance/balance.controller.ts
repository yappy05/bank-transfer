import { Controller, Post } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Eviction } from '@app/my-library/common/decorators/eviction.decorator';

@ApiBearerAuth()
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}
  @Eviction('/user/profile/me*', '/user/profile/all*')
  @Post('zero-balance')
  public async clean(@CurrentUser('login') login: string) {
    return this.balanceService.clean(login);
  }
}
